<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\AppBaseController;
use App\Http\Requests\CreateProviderRequest;
use App\Http\Requests\UpdateProviderRequest;
use App\Http\Resources\ProviderCollection;
use App\Http\Resources\ProviderResource;
use App\Models\Service;
use App\Repositories\ProviderRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Prettus\Validator\Exceptions\ValidatorException;

/**
 * Class ProviderAPIController
 */
class ProviderAPIController extends AppBaseController
{
    /** @var ProviderRepository */
    private $providerRepository;

    public function __construct(ProviderRepository $providerRepository)
    {
        $this->providerRepository = $providerRepository;
    }

    public function index(Request $request): ProviderCollection
    {
        Log::info('ProviderAPIController: index called', ['request' => $request->all()]);
        $perPage = getPageSize($request);
        $providers = $this->providerRepository->paginate($perPage);
        Log::info('ProviderAPIController: providers fetched', ['count' => $providers->count()]);
        ProviderResource::usingWithCollection();

        return new ProviderCollection($providers);
    }

    /**
     * @throws ValidatorException
     */
    public function store(CreateProviderRequest $request): ProviderResource
    {
        Log::info('ProviderAPIController: store called', ['input' => $request->all()]);
        $input = $request->all();
        $provider = $this->providerRepository->create($input);
        Log::info('ProviderAPIController: provider created', ['id' => $provider->id]);

        return new ProviderResource($provider);
    }

    public function show($id): ProviderResource
    {
        $provider = $this->providerRepository->find($id);

        return new ProviderResource($provider);
    }

    /**
     * @throws ValidatorException
     */
    public function update(UpdateProviderRequest $request, $id): ProviderResource
    {
        Log::info('ProviderAPIController: update called', ['id' => $id, 'input' => $request->all(), 'files' => $request->allFiles()]);
        $input = $request->all();
        Log::info('ProviderAPIController: input after all()', $input);
        $provider = $this->providerRepository->update($input, $id);
        Log::info('ProviderAPIController: provider updated', ['id' => $provider->id]);

        return new ProviderResource($provider);
    }

    public function destroy($id): JsonResponse
    {
        Log::info('ProviderAPIController: destroy called', ['id' => $id]);
        // Note: Removed canDelete check for services as services table doesn't have provider_id column
        // If services are related to providers, migration needs to be updated
        $this->providerRepository->delete($id);
        Log::info('ProviderAPIController: provider deleted', ['id' => $id]);

        return $this->sendSuccess('Provider deleted successfully');
    }
}
