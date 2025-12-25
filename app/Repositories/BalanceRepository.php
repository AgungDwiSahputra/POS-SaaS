<?php

namespace App\Repositories;

use App\Models\BalanceRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Class BalanceRepository
 */
class BalanceRepository extends BaseRepository
{
    /**
     * @var array
     */
    protected $fieldSearchable = [
        'provider_id',
        'user_id',
        'amount',
        'status',
        'notes',
        'created_at',
    ];

    /**
     * Get available relations for inclusion
     */
    public function getAvailableRelations(): array
    {
        return ['provider', 'user'];
    }

    /**
     * Return searchable fields
     */
    public function getFieldsSearchable(): array
    {
        return $this->fieldSearchable;
    }

    /**
     * Configure the Model
     **/
    public function model()
    {
        return BalanceRequest::class;
    }

    public function create(array $attributes)
    {
        Log::info('BalanceRepository: create called', ['attributes' => $attributes]);
        $result = parent::create($attributes);
        Log::info('BalanceRepository: create result', ['id' => $result->id ?? null]);
        return $result;
    }

    public function update(array $attributes, $id)
    {
        Log::info('BalanceRepository: update called', ['id' => $id, 'attributes' => $attributes]);
        $result = parent::update($attributes, $id);
        Log::info('BalanceRepository: update result', ['id' => $result->id ?? null]);
        return $result;
    }

    public function delete($id)
    {
        Log::info('BalanceRepository: delete called', ['id' => $id]);
        $result = parent::delete($id);
        Log::info('BalanceRepository: delete result', ['result' => $result]);
        return $result;
    }

    /**
     * Approve a balance request
     * This will update the request status to approved and add the amount to the provider's saldo
     */
    public function approve($id)
    {
        Log::info('BalanceRepository: approve called', ['id' => $id]);

        return DB::transaction(function () use ($id) {
            $balanceRequest = $this->find($id);

            if (!$balanceRequest) {
                Log::error('BalanceRepository: approve - request not found', ['id' => $id]);
                throw new \Exception('Balance request not found');
            }

            if (!$balanceRequest->isPending()) {
                Log::warning('BalanceRepository: approve - request not pending', ['id' => $id, 'status' => $balanceRequest->status]);
                throw new \Exception('Only pending requests can be approved');
            }

            // Update the request status
            $balanceRequest->status = BalanceRequest::STATUS_APPROVED;
            $balanceRequest->save();

            // Update provider's saldo
            $provider = $balanceRequest->provider;
            if ($provider) {
                $oldSaldo = $provider->saldo;
                $provider->saldo = $provider->saldo + $balanceRequest->amount;
                $provider->save();

                Log::info('BalanceRepository: approve - provider saldo updated', [
                    'provider_id' => $provider->id,
                    'old_saldo' => $oldSaldo,
                    'amount_added' => $balanceRequest->amount,
                    'new_saldo' => $provider->saldo
                ]);
            } else {
                Log::error('BalanceRepository: approve - provider not found', ['provider_id' => $balanceRequest->provider_id]);
                throw new \Exception('Provider not found');
            }

            Log::info('BalanceRepository: approve result', ['id' => $balanceRequest->id, 'status' => $balanceRequest->status]);

            // Reload the balance request with updated relationships
            return $this->find($balanceRequest->id);
        });
    }

    /**
     * Reject a balance request
     */
    public function reject($id)
    {
        Log::info('BalanceRepository: reject called', ['id' => $id]);
        $balanceRequest = $this->find($id);
        $balanceRequest->status = BalanceRequest::STATUS_REJECTED;
        $balanceRequest->save();
        Log::info('BalanceRepository: reject result', ['id' => $balanceRequest->id, 'status' => $balanceRequest->status]);
        return $balanceRequest;
    }

    /**
     * Get all balance requests with optional filtering
     */
    public function getBalanceRequests(array $filters = [])
    {
        Log::info('BalanceRepository: getBalanceRequests called', ['filters' => $filters]);
        $query = $this->model->newQuery();

        // Apply filters
        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['provider_id'])) {
            $query->where('provider_id', $filters['provider_id']);
        }

        if (isset($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        if (isset($filters['amount_min'])) {
            $query->where('amount', '>=', $filters['amount_min']);
        }

        if (isset($filters['amount_max'])) {
            $query->where('amount', '<=', $filters['amount_max']);
        }

        if (isset($filters['created_from'])) {
            $query->where('created_at', '>=', $filters['created_from']);
        }

        if (isset($filters['created_to'])) {
            $query->where('created_at', '<=', $filters['created_to']);
        }

        $result = $query->get();
        Log::info('BalanceRepository: getBalanceRequests result', ['count' => $result->count()]);
        return $result;
    }

    /**
     * Create a new balance request
     */
    public function createBalanceRequest(array $attributes)
    {
        Log::info('BalanceRepository: createBalanceRequest called', ['attributes' => $attributes]);
        return $this->create($attributes);
    }

    /**
     * Update an existing balance request
     */
    public function updateBalanceRequest(array $attributes, $id)
    {
        Log::info('BalanceRepository: updateBalanceRequest called', ['id' => $id, 'attributes' => $attributes]);
        return $this->update($attributes, $id);
    }

    /**
     * Delete a balance request
     */
    public function deleteBalanceRequest($id)
    {
        Log::info('BalanceRepository: deleteBalanceRequest called', ['id' => $id]);
        return $this->delete($id);
    }

    /**
     * Get balance requests by status
     */
    public function getBalanceRequestsByStatus(string $status)
    {
        Log::info('BalanceRepository: getBalanceRequestsByStatus called', ['status' => $status]);
        return $this->getBalanceRequests(['status' => $status]);
    }

    /**
     * Get balance requests by provider
     */
    public function getBalanceRequestsByProvider(int $providerId)
    {
        Log::info('BalanceRepository: getBalanceRequestsByProvider called', ['provider_id' => $providerId]);
        return $this->getBalanceRequests(['provider_id' => $providerId]);
    }

    /**
     * Get balance requests by user
     */
    public function getBalanceRequestsByUser(int $userId)
    {
        Log::info('BalanceRepository: getBalanceRequestsByUser called', ['user_id' => $userId]);
        return $this->getBalanceRequests(['user_id' => $userId]);
    }
}