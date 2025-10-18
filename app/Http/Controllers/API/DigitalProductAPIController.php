<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\AppBaseController;
use App\Http\Requests\CreateDigitalProductRequest;
use App\Http\Requests\UpdateDigitalProductRequest;
use App\Http\Resources\DigitalProductCollection;
use App\Http\Resources\DigitalProductResource;
use App\Models\DigitalProduct;
use App\Repositories\DigitalProductRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Storage;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class DigitalProductAPIController extends AppBaseController
{
    /** @var DigitalProductRepository */
    private $digitalProductRepository;

    public function __construct(DigitalProductRepository $digitalProductRepository)
    {
        $this->digitalProductRepository = $digitalProductRepository;
    }

    public function index(Request $request)
    {
        try {
            $perPage = getPageSize($request);

            if ($request->get('product_unit')) {
                $this->digitalProductRepository->where('product_unit', $request->get('product_unit'));
            }

            if (isset($request->filter['search'])) {
                $search = $request->filter['search'];
                $this->digitalProductRepository->where('name', 'like', '%' . $search . '%');
            }

            // Handle sorting
            if (isset($request->filter['order_By'])) {
                $orderBy = $request->filter['order_By'];
                $direction = $request->filter['direction'] ?? 'asc';
                
                // Validate sort field to prevent SQL injection
                $allowedSortFields = ['id', 'name', 'code', 'price', 'cost', 'created_at', 'updated_at'];
                if (in_array($orderBy, $allowedSortFields)) {
                    $this->digitalProductRepository->orderBy($orderBy, $direction);
                }
            }

            $digitalProducts = $this->digitalProductRepository->paginate($perPage);
            DigitalProductResource::usingWithCollection();

            return new DigitalProductCollection($digitalProducts);
        } catch (\Exception $e) {
            Log::error('Error in DigitalProductAPIController@index: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return Response::json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * @return DigitalProductResource|JsonResponse
     */
    public function store(CreateDigitalProductRequest $request)
    {
        $input = $request->all();

        Log::info('DigitalProductAPIController - Store method called');
        Log::info('Input data received:', $input);

        try {
            DB::beginTransaction();

            $digitalProduct = $this->digitalProductRepository->storeDigitalProduct($input);

            Log::info('Digital product created successfully:', $digitalProduct->toArray());

            DB::commit();

            return new DigitalProductResource($digitalProduct);
        } catch (\Exception $e) {
            Log::error('Error creating digital product:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'input' => $input
            ]);
            DB::rollBack();

            return Response::json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $digitalProduct = $this->digitalProductRepository->find($id);

            return new DigitalProductResource($digitalProduct);
        } catch (\Exception $e) {
            Log::error('Error in DigitalProductAPIController@show: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return Response::json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function update(UpdateDigitalProductRequest $request, $id)
    {
        $input = $request->all();

        try {
            DB::beginTransaction();

            // Remove images from input before updating to avoid mass assignment issues
            $images = [];
            if (isset($input['images']) && !empty($input['images'])) {
                $images = $input['images'];
                unset($input['images']);
            }

            $digitalProduct = $this->digitalProductRepository->updateDigitalProduct($input, $id);

            // Handle multiple images upload if exists
            if (!empty($images)) {
                // Clear existing media collection
                $digitalProduct->clearMediaCollection(DigitalProduct::PATH);

                foreach ($images as $image) {
                    $digitalProduct->addMedia($image)->toMediaCollection(
                        DigitalProduct::PATH,
                        config('app.media_disc')
                    );
                }
            }

            DB::commit();

            return new DigitalProductResource($digitalProduct);
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error in DigitalProductAPIController@update: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return Response::json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function destroy($id): JsonResponse
    {
        try {
            $digitalProduct = $this->digitalProductRepository->find($id);

            // Clear media files
            $digitalProduct->clearMediaCollection(DigitalProduct::PATH);

            $this->digitalProductRepository->delete($id);

            return $this->sendSuccess('Digital product deleted successfully');
        } catch (\Exception $e) {
            Log::error('Error in DigitalProductAPIController@destroy: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return Response::json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function digitalProductImageDelete($mediaId): JsonResponse
    {
        try {
            $media = Media::where('id', $mediaId)->firstOrFail();
            $media->delete();

            return $this->sendSuccess('Digital product image deleted successfully');
        } catch (\Exception $e) {
            Log::error('Error in DigitalProductAPIController@digitalProductImageDelete: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return Response::json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}