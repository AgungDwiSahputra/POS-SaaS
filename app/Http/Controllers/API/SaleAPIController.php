<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\AppBaseController;
use App\Http\Requests\CreateSaleRequest;
use App\Http\Requests\UpdateSaleRequest;
use App\Http\Resources\SaleCollection;
use App\Http\Resources\SaleResource;
use App\Models\Customer;
use App\Models\Hold;
use App\Models\Sale;
use App\Models\Taxe;
use App\Models\Setting;
use App\Models\Warehouse;
use App\Repositories\SaleRepository;
use Barryvdh\DomPDF\Facade\Pdf;
use Exception;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

/**
 * Class SaleAPIController
 */
class SaleAPIController extends AppBaseController
{
    /** @var saleRepository */
    private $saleRepository;

    public function __construct(SaleRepository $saleRepository)
    {
        $this->saleRepository = $saleRepository;
    }

    public function index(Request $request): SaleCollection
    {
        $perPage = getPageSize($request);
        $search = $request->filter['search'] ?? '';

        $salesQuery = Sale::query()->with('customer', 'warehouse', 'saleItems');

        if ($request->get('start_date') && $request->get('end_date')) {
            $salesQuery->whereBetween('date', [$request->get('start_date'), $request->get('end_date')]);
        }

        if ($request->get('warehouse_id')) {
            $salesQuery->where('warehouse_id', $request->get('warehouse_id'));
        }

        if ($request->get('customer_id')) {
            $salesQuery->where('customer_id', $request->get('customer_id'));
        }

        if ($request->get('user_id')) {
            $salesQuery->where('user_id', $request->get('user_id'));
        }

        if ($request->get('status') && $request->get('status') != 'null') {
            $salesQuery->where('status', $request->get('status'));
        }

        if ($request->get('payment_status') && $request->get('payment_status') != 'null') {
            $salesQuery->where('payment_status', $request->get('payment_status'));
        }

        if ($request->get('payment_type') && $request->get('payment_type') != 'null') {
            $salesQuery->where('payment_type', $request->get('payment_type'));
        }

        // Fix: Search by reference_code, customer, warehouse, and product names using whereIn with subquery
        if (!empty($search)) {
            $matchingSaleIds = DB::table('sales')
                ->select('sales.id')
                ->leftJoin('customers', 'sales.customer_id', '=', 'customers.id')
                ->leftJoin('warehouses', 'sales.warehouse_id', '=', 'warehouses.id')
                ->leftJoin('sale_items', 'sales.id', '=', 'sale_items.sale_id')
                ->leftJoin('products', 'sale_items.product_id', '=', 'products.id')
                ->leftJoin('main_products', 'products.main_product_id', '=', 'main_products.id')
                ->where('sales.tenant_id', '=', currentTenantId())
                ->where(function ($q) use ($search) {
                    $q->where('sales.reference_code', 'LIKE', "%$search%")
                        ->orWhere('customers.name', 'LIKE', "%$search%")
                        ->orWhere('warehouses.name', 'LIKE', "%$search%")
                        ->orWhere('products.name', 'LIKE', "%$search%")
                        ->orWhere('main_products.name', 'LIKE', "%$search%");
                })
                ->pluck('sales.id')
                ->unique()
                ->values();

            $salesQuery->whereIn('id', $matchingSaleIds);
        }

        $sales = $salesQuery->paginate($perPage);

        SaleResource::usingWithCollection();

        return new SaleCollection($sales);
    }

    public function store(CreateSaleRequest $request): SaleResource
    {
        if (isset($request->hold_ref_no)) {
            $holdExist = Hold::whereReferenceCode($request->hold_ref_no)->first();
            if (!empty($holdExist)) {
                $holdExist->delete();
            }
        }
        $input = $request->all();
        if (isset($input['payment_status']) && $input['payment_status'] != Sale::UNPAID) {
            $grand_total = floatval($input['grand_total'] ?? 0);
            $paymentDetails = $input['payment_details'] ?? [];

            if (empty($paymentDetails) || !is_array($paymentDetails)) {
                throw new UnprocessableEntityHttpException('Payment details are required when payment status is PAID.');
            }

            $totalAmount = collect($paymentDetails)->sum(function ($detail) {
                return floatval($detail['amount'] ?? 0);
            });

            // if ($totalAmount > $grand_total) {
            //     throw new UnprocessableEntityHttpException('Total payment amount cannot be greater than the grand total.');
            // }

            // if ($totalAmount < $grand_total) {
            //     throw new UnprocessableEntityHttpException('Total payment amount should be equal to grand total.');
            // }
        }
        $sale = $this->saleRepository->storeSale($input);

        return new SaleResource($sale);
    }

    public function show($id): SaleResource
    {
        $sale = $this->saleRepository->find($id);

        return new SaleResource($sale);
    }

    public function edit(Sale $sale): SaleResource
    {
        $sale = $sale->load('saleItems.product.stocks', 'warehouse');

        return new SaleResource($sale);
    }

    public function update(UpdateSaleRequest $request, $id): SaleResource
    {
        $input = $request->all();
        if (isset($input['payment_status']) && $input['payment_status'] != Sale::UNPAID) {
            $grand_total = floatval($input['grand_total'] ?? 0);
            $paymentDetails = $input['payment_details'] ?? [];

            if (empty($paymentDetails) || !is_array($paymentDetails)) {
                throw new UnprocessableEntityHttpException('Payment details are required when payment status is PAID.');
            }

            $totalAmount = collect($paymentDetails)->sum(function ($detail) {
                return floatval($detail['amount'] ?? 0);
            });

            // if ($totalAmount > $grand_total) {
            //     throw new UnprocessableEntityHttpException('Total payment amount cannot be greater than the grand total.');
            // }

            // if ($totalAmount < $grand_total) {
            //     throw new UnprocessableEntityHttpException('Total payment amount should be equal to grand total.');
            // }
        }
        $sale = $this->saleRepository->updateSale($input, $id);

        return new SaleResource($sale);
    }

    public function destroy($id): JsonResponse
    {
        try {
            DB::beginTransaction();
            $sale = $this->saleRepository->with('saleItems')->where('id', $id)->first();
            foreach ($sale->saleItems as $saleItem) {
                manageStock($sale->warehouse_id, $saleItem['product_id'], $saleItem['quantity']);
            }
            if (File::exists(Storage::path('sales/barcode-' . $sale->reference_code . '.png'))) {
                File::delete(Storage::path('sales/barcode-' . $sale->reference_code . '.png'));
            }
            $this->saleRepository->delete($id);
            DB::commit();

            return $this->sendSuccess('Sale Deleted successfully');
        } catch (Exception $e) {
            DB::rollBack();
            throw new UnprocessableEntityHttpException($e->getMessage());
        }
    }

    /**
     * @throws \Spatie\MediaLibrary\MediaCollections\Exceptions\FileDoesNotExist
     * @throws \Spatie\MediaLibrary\MediaCollections\Exceptions\FileIsTooBig
     */
    public function pdfDownload(Sale $sale): JsonResponse
    {
        ini_set('memory_limit', '-1');
        $sale = $sale->load('customer', 'saleItems.product', 'payments');
        $data = [];
        if (Storage::exists('pdf/Sale-' . $sale->reference_code . '.pdf')) {
            Storage::delete('pdf/Sale-' . $sale->reference_code . '.pdf');
        }
        $companyLogo = getStoreLogo();

        $companyLogo = (string) \Image::make($companyLogo)->encode('data-url');

        $taxes = Taxe::where('status', 1)->get();

        $pdf = PDF::loadView('pdf.sale-pdf', compact('sale', 'companyLogo', 'taxes'));
        Storage::disk(config('app.media_disc'))->put('pdf/Sale-' . $sale->reference_code . '.pdf', $pdf->output());
        $data['sale_pdf_url'] = Storage::url('pdf/Sale-' . $sale->reference_code . '.pdf');

        return $this->sendResponse($data, 'pdf retrieved Successfully');
    }

    public function saleInfo(Sale $sale): JsonResponse
    {
        $sale = $sale->load('saleItems.product', 'warehouse', 'customer', 'payments');
        $keyName = [
            'store_email', 'store_name', 'store_phone', 'store_address',
        ];
        $companyInfo = Setting::whereIn('key', $keyName)->pluck('value', 'key')->toArray();
        if(getActiveStoreName()) {
            $companyInfo['store_name'] = getActiveStoreName();
        }
        $sale->company_info = $companyInfo;
        $sale['barcode_url'] = Storage::url('sales/barcode-' .  $sale->reference_code . '.png');
        return $this->sendResponse($sale, 'Sale information retrieved successfully');
    }

    public function getSaleProductReport(Request $request): SaleCollection
    {
        $perPage = getPageSize($request);
        $productId = $request->get('product_id');
        $sales = $this->saleRepository->whereHas('saleItems', function ($q) use ($productId) {
            $q->where('product_id', '=', $productId);
        })->with(['saleItems.product', 'customer']);

        $sales = $sales->paginate($perPage);

        SaleResource::usingWithCollection();

        return new SaleCollection($sales);
    }
}
