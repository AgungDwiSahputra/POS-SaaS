<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\AppBaseController;
use App\Http\Requests\CreateDigitalSaleRequest;
use App\Http\Requests\UpdateDigitalSaleRequest;
use App\Http\Resources\DigitalSaleCollection;
use App\Http\Resources\DigitalSaleResource;
use App\Models\DigitalSale;
use App\Repositories\DigitalSaleRepository;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class DigitalSaleAPIController extends AppBaseController
{
    private $digitalSaleRepository;

    public function __construct(DigitalSaleRepository $digitalSaleRepository)
    {
        $this->digitalSaleRepository = $digitalSaleRepository;
    }

    public function index(Request $request): DigitalSaleCollection
    {
        $perPage = getPageSize($request);
        $search = $request->filter['search'] ?? '';

        $salesQuery = DigitalSale::query()->with('provider', 'user');

        // Date range filter
        if ($request->get('start_date') && $request->get('end_date')) {
            $salesQuery->whereBetween('date', [$request->get('start_date'), $request->get('end_date')]);
        }

        // Provider filter
        if ($request->get('provider_id')) {
            $salesQuery->where('provider_id', $request->get('provider_id'));
        }

        // User filter
        if ($request->get('user_id')) {
            $salesQuery->where('user_id', $request->get('user_id'));
        }

        // Status filter
        if ($request->get('status') && $request->get('status') != 'null') {
            $salesQuery->where('status', $request->get('status'));
        }

        // Search by reference_code, provider name
        if (!empty($search)) {
            $salesQuery->where(function ($q) use ($search) {
                $q->where('digital_sales.reference_code', 'LIKE', "%$search%")
                    ->orWhereHas('provider', function ($query) use ($search) {
                        $query->where('nama_provider', 'LIKE', "%$search%");
                    });
            });
        }

        $salesQuery->orderBy('id', 'desc');
        $sales = $salesQuery->paginate($perPage);

        DigitalSaleResource::usingWithCollection();

        return new DigitalSaleCollection($sales);
    }

    public function store(CreateDigitalSaleRequest $request): DigitalSaleResource
    {
        $input = $request->all();
        $sale = $this->digitalSaleRepository->storeDigitalSale($input);

        return new DigitalSaleResource($sale);
    }

    public function show($id): DigitalSaleResource
    {
        $sale = DigitalSale::with('provider', 'user')->findOrFail($id);

        return new DigitalSaleResource($sale);
    }

    public function edit(DigitalSale $sale): DigitalSaleResource
    {
        $sale->load('provider', 'user');

        return new DigitalSaleResource($sale);
    }

    public function update(UpdateDigitalSaleRequest $request, $id): DigitalSaleResource
    {
        $input = $request->all();
        $sale = $this->digitalSaleRepository->updateDigitalSale($input, $id);

        return new DigitalSaleResource($sale);
    }

    public function destroy($id): JsonResponse
    {
        try {
            DB::beginTransaction();

            $this->digitalSaleRepository->deleteDigitalSale($id);

            DB::commit();

            return $this->sendSuccess('Digital Sale deleted successfully');
        } catch (Exception $e) {
            DB::rollBack();
            throw new UnprocessableEntityHttpException($e->getMessage());
        }
    }

    public function saleInfo(DigitalSale $sale): JsonResponse
    {
        $sale = $sale->load('provider', 'user');

        return $this->sendResponse($sale, 'Digital sale information retrieved successfully');
    }

    /**
     * Get provider balance for validation
     */
    public function providerBalance(Request $request): JsonResponse
    {
        $providerId = $request->get('provider_id');

        if (!$providerId) {
            return $this->sendError('Provider ID is required');
        }

        $provider = \App\Models\Provider::find($providerId);

        if (!$provider) {
            return $this->sendError('Provider not found');
        }

        return $this->sendResponse([
            'provider_id' => $provider->id,
            'nama_provider' => $provider->nama_provider,
            'saldo' => $provider->saldo,
        ], 'Provider balance retrieved successfully');
    }
}
