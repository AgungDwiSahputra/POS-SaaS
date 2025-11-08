<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\AppBaseController;
use App\Http\Requests\CreateMainProductRequest;
use App\Http\Requests\UpdateMainProductRequest;
use App\Http\Resources\MainProductCollection;
use App\Http\Resources\MainProductResource;
use App\Models\MainProduct;
use App\Models\Product;
use App\Models\PurchaseItem;
use App\Models\SaleItem;
use App\Models\VariationProduct;
use App\Repositories\MainProductRepository;
use App\Repositories\ProductRepository;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class MainProductAPIController extends AppBaseController
{
    /** @var MainProductRepository */
    private $mainProductRepository;

    public function __construct(MainProductRepository $mainProductRepository)
    {
        $this->mainProductRepository = $mainProductRepository;
    }


    public function index(Request $request)
    {
        $perPage = getPageSize($request);
        $products = $this->mainProductRepository;

        if ($request->get('product_unit')) {
            $products->where('product_unit', $request->get('product_unit'));
        }

        if ($request->get('brand_id')) {
            $products->whereHas('products.brand', function ($q) use ($request) {
                $q->where('brands.id', $request->get('brand_id'));
            });
        }

        if ($request->get('product_category_id')) {
            $products->whereHas('products.productCategory', function ($q) use ($request) {
                $q->where('product_categories.id', $request->get('product_category_id'));
            });
        }

        if ($request->get('warehouse_id') && $request->get('warehouse_id') != 'null') {
            $warehouseId = $request->get('warehouse_id');
            $products->whereHas('products.stock', function ($q) use ($warehouseId) {
                $q->where('manage_stocks.warehouse_id', $warehouseId);
            })->with([
                'products' => function ($query) use ($warehouseId) {
                    $query->with([
                        'stock' => function (HasOne $stockQuery) use ($warehouseId) {
                            $stockQuery->where('manage_stocks.warehouse_id', $warehouseId);
                        },
                    ]);
                },
            ]);
        }

        $products = $products->paginate($perPage);
        MainProductResource::usingWithCollection();

        return new MainProductCollection($products);
    }

    public function show($id): MainProductResource
    {
        /** @var MainProduct $mainProduct */
        $mainProduct = $this->mainProductRepository->find($id);

        return new MainProductResource($mainProduct);
    }

    public function store(CreateMainProductRequest $request)
    {
        $input = $request->all();

        try {
            DB::beginTransaction();

            $productRepo = app(ProductRepository::class);
            $mainProduct = MainProduct::create([
                'name' => $input['name'],
                'code' => $input['product_code'],
                'product_unit' => $input['product_unit'],
                'product_type' => $input['product_type'],
            ]);

            if (isset($input['images']) && !empty($input['images'])) {
                foreach ($input['images'] as $image) {
                    $product['image_url'] = $mainProduct->addMedia($image)->toMediaCollection(
                        MainProduct::PATH,
                        config('app.media_disc')
                    );
                }
            }

            $input['main_product_id'] = $mainProduct->id;
            if ($input['product_type'] == 2) {
                $commonProductInput = Arr::except($input, 'variation_data');

                $variationData = $input['variation_data'];
                foreach ($variationData as $key => $variation) {
                    $variation = array_merge($variation, $commonProductInput);
                    $product = $productRepo->storeProduct($variation);

                    VariationProduct::create([
                        'product_id' => $product->id,
                        'variation_id' => $variation['variation_id'],
                        'variation_type_id' => $variation['variation_type_id'],
                        'main_product_id' => $mainProduct->id,
                    ]);
                }
            } else {
                $product = $productRepo->storeProduct($input);
            }
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            throw new UnprocessableEntityHttpException($e->getMessage());
        }

        return new MainProductResource($mainProduct);
    }

    public function update(UpdateMainProductRequest $request, $id): MainProductResource
    {
        try {
            $input = $request->all();
            $mainProduct = MainProduct::find($id);

            if (!$mainProduct) {
                throw new UnprocessableEntityHttpException('Product not found');
            }

            // Validasi kode produk untuk single product dalam tenant yang sama
            if ($mainProduct->product_type == MainProduct::SINGLE_PRODUCT) {
                $existingProduct = Product::where('code', $input['product_code'])
                    ->where('tenant_id', Auth::user()->tenant_id)
                    ->where('main_product_id', '!=', $mainProduct->id)
                    ->first();

                if ($existingProduct) {
                    throw new UnprocessableEntityHttpException(__('messages.error.code_taken'));
                }
            }

            // Update MainProduct fields only
            $mainProduct->update([
                'name' => $input['name'],
                'code' => $input['product_code'],
                'product_unit' => $input['product_unit'],
            ]);

            // Handle image uploads
            if (isset($input['images']) && !empty($input['images'])) {
                foreach ($input['images'] as $image) {
                    $mainProduct->addMedia($image)->toMediaCollection(
                        MainProduct::PATH,
                        config('app.media_disc')
                    );
                }
            }

            // Update related Products
            $products = Product::where('main_product_id', $id)->get();

            foreach ($products as $product) {
                // Prepare input for product update
                $productInput = array_merge($input, [
                    'main_product_id' => $mainProduct->id,
                    'name' => $mainProduct->name,
                    'product_unit' => $mainProduct->product_unit,
                ]);

                if ($mainProduct->product_type == MainProduct::VARIATION_PRODUCT) {
                    // Keep existing code for variation products
                    $productInput['code'] = $product->code;
                } else {
                    $productInput['code'] = $input['product_code'];
                }

                $productRepo = app(ProductRepository::class);
                $productRepo->updateProduct($productInput, $product->id);
            }

            return new MainProductResource($mainProduct->load('products'));
        } catch (\Exception $e) {
            \Log::error('MainProduct update failed: ' . $e->getMessage(), [
                'id' => $id,
                'input' => $request->all(),
                'trace' => $e->getTraceAsString()
            ]);
            throw new UnprocessableEntityHttpException($e->getMessage());
        }
    }

    public function destroy($id): JsonResponse
    {
        try {
            \Log::info('Starting delete process for main product ID: ' . $id);

            DB::beginTransaction();

            // Find main product first
            $mainProduct = MainProduct::find($id);
            if (!$mainProduct) {
                \Log::error('Main product not found: ' . $id);
                DB::rollBack();
                return $this->sendError('Product not found');
            }

            \Log::info('Found main product: ' . $mainProduct->name);

            $products = Product::where('main_product_id', $id)->get();
            \Log::info('Found ' . $products->count() . ' related products');

            foreach ($products as $product) {
                \Log::info('Checking product ID: ' . $product->id . ' - ' . $product->name);

                $purchaseItemModels = [
                    PurchaseItem::class,
                ];
                $saleItemModels = [
                    SaleItem::class,
                ];

                $purchaseResult = canDelete($purchaseItemModels, 'product_id', $product->id);
                $saleResult = canDelete($saleItemModels, 'product_id', $product->id);

                \Log::info('Purchase relations: ' . ($purchaseResult ? 'FOUND' : 'NONE'));
                \Log::info('Sale relations: ' . ($saleResult ? 'FOUND' : 'NONE'));

                if ($purchaseResult || $saleResult) {
                    // Provide specific error message based on why the product can't be deleted
                    if ($purchaseResult && $saleResult) {
                        $errorMessage = __('messages.error.product_cant_deleted_both');
                    } elseif ($purchaseResult) {
                        $errorMessage = __('messages.error.product_cant_deleted_purchases');
                    } else {
                        $errorMessage = __('messages.error.product_cant_deleted_sales');
                    }

                    \Log::warning('Cannot delete product due to relations: ' . $errorMessage);
                    DB::rollBack();
                    return $this->sendError($errorMessage);
                }

                // Delete barcode file
                if (File::exists(Storage::path('product_barcode/barcode-PR_' . $product->id . '.png'))) {
                    File::delete(Storage::path('product_barcode/barcode-PR_' . $product->id . '.png'));
                    \Log::info('Deleted barcode for product: ' . $product->id);
                }

                // Delete product
                $deleted = $product->delete();
                \Log::info('Product deletion result: ' . ($deleted ? 'SUCCESS' : 'FAILED'));
            }

            // Delete variation products
            $variationDeleted = VariationProduct::where('main_product_id', $id)->delete();
            \Log::info('Deleted variation products: ' . $variationDeleted . ' records');

            // Delete main product - use direct delete instead of repository
            $mainProductDeleted = $mainProduct->delete();
            \Log::info('Main product deletion result: ' . ($mainProductDeleted ? 'SUCCESS' : 'FAILED'));

            DB::commit();
            \Log::info('Transaction committed successfully');

        } catch (\Exception $e) {
            \Log::error('Delete failed: ' . $e->getMessage(), [
                'id' => $id,
                'trace' => $e->getTraceAsString()
            ]);
            DB::rollBack();
            return $this->sendError($e->getMessage());
        }

        return $this->sendSuccess('Product deleted successfully');
    }
}
