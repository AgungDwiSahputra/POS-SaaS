<?php

namespace App\Repositories;

use App\Models\BalanceRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Class BalanceRequestRepository
 */
class BalanceRequestRepository extends BaseRepository
{
    /**
     * @var array
     */
    protected $fieldSearchable = [
        'provider_id',
        'requested_amount',
        'status',
        'notes',
        'created_at',
    ];

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

    /**
     * Create balance request with user tracking
     */
    public function create(array $attributes)
    {
        Log::info('BalanceRequestRepository: create called', ['attributes' => $attributes]);

        $attributes['status'] = BalanceRequest::STATUS_PENDING;
        $attributes['requested_by'] = auth()->id();

        $result = parent::create($attributes);

        Log::info('BalanceRequestRepository: create result', ['id' => $result->id ?? null]);

        return $result;
    }

    /**
     * Update balance request
     */
    public function update(array $attributes, $id)
    {
        Log::info('BalanceRequestRepository: update called', ['id' => $id, 'attributes' => $attributes]);
        $result = parent::update($attributes, $id);
        Log::info('BalanceRequestRepository: update result', ['id' => $result->id ?? null]);
        return $result;
    }

    /**
     * Delete balance request
     */
    public function delete($id)
    {
        Log::info('BalanceRequestRepository: delete called', ['id' => $id]);
        $result = parent::delete($id);
        Log::info('BalanceRequestRepository: delete result', ['result' => $result]);
        return $result;
    }

    /**
     * Approve balance request and update provider balance
     */
    public function approveRequest(int $id, int $processedBy): BalanceRequest
    {
        return DB::transaction(function () use ($id, $processedBy) {
            $request = $this->find($id);

            if ($request->status !== BalanceRequest::STATUS_PENDING) {
                throw new \Exception('Only pending requests can be approved.');
            }

            $provider = $request->provider;
            $provider->saldo += $request->requested_amount;
            $provider->save();

            $request->status = BalanceRequest::STATUS_APPROVED;
            $request->processed_by = $processedBy;
            $request->processed_at = now();
            $request->save();

            Log::info('BalanceRequest approved', [
                'request_id' => $id,
                'provider_id' => $provider->id,
                'amount' => $request->requested_amount,
                'new_balance' => $provider->saldo,
            ]);

            return $request->fresh();
        });
    }

    /**
     * Reject balance request
     */
    public function rejectRequest(int $id, int $processedBy): BalanceRequest
    {
        return DB::transaction(function () use ($id, $processedBy) {
            $request = $this->find($id);

            if ($request->status !== BalanceRequest::STATUS_PENDING) {
                throw new \Exception('Only pending requests can be rejected.');
            }

            $request->status = BalanceRequest::STATUS_REJECTED;
            $request->processed_by = $processedBy;
            $request->processed_at = now();
            $request->save();

            Log::info('BalanceRequest rejected', [
                'request_id' => $id,
                'provider_id' => $request->provider_id,
            ]);

            return $request->fresh();
        });
    }

    /**
     * Get pending requests count
     */
    public function getPendingCount(): int
    {
        return $this->model
            ->where('status', BalanceRequest::STATUS_PENDING)
            ->count();
    }
}
