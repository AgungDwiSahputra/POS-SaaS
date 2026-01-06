<?php

namespace App\Repositories;

use App\Models\DigitalSale;
use App\Models\Provider;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class DigitalSaleRepository extends BaseRepository
{
    protected $fieldSearchable = [
        'date',
        'cost',
        'price',
        'margin',
        'reference_code',
        'created_at',
    ];

    protected $allowedFields = [
        'date',
        'cost',
        'price',
        'margin',
        'reference_code',
        'created_at',
    ];

    public function getFieldsSearchable(): array
    {
        return $this->fieldSearchable;
    }

    public function model(): string
    {
        return DigitalSale::class;
    }

    /**
     * Store a new digital sale transaction
     *
     * @param array $input
     * @return DigitalSale
     * @throws Exception
     */
    public function storeDigitalSale($input): DigitalSale
    {
        try {
            DB::beginTransaction();

            // Get provider
            $provider = Provider::findOrFail($input['provider_id']);

            // Validate provider balance
            if ($provider->saldo < $input['cost']) {
                throw new UnprocessableEntityHttpException(
                    'Insufficient provider balance. Required: ' . number_format($input['cost'], 2) .
                    ', Available: ' . number_format($provider->saldo, 2)
                );
            }

            // Calculate margin
            $input['margin'] = $input['price'] - $input['cost'];

            // Generate reference code
            $input['date'] = $input['date'] ?? date('Y-m-d');
            $input['status'] = $input['status'] ?? DigitalSale::COMPLETED;
            $input['user_id'] = Auth::id();

            // Create digital sale
            /** @var DigitalSale $sale */
            $sale = DigitalSale::create($input);

            // Generate reference code after getting ID
            $reference_code = getSettingValue('sale_code') . '_DIG_' . $sale->id;
            $sale->update(['reference_code' => $reference_code]);

            // Deduct provider balance
            $provider->saldo -= $input['cost'];
            $provider->save();

            DB::commit();

            return $sale->fresh(['provider']);
        } catch (Exception $e) {
            DB::rollBack();
            throw new UnprocessableEntityHttpException($e->getMessage());
        }
    }

    /**
     * Update an existing digital sale transaction
     *
     * @param array $input
     * @param int $id
     * @return DigitalSale
     * @throws Exception
     */
    public function updateDigitalSale($input, $id)
    {
        try {
            DB::beginTransaction();

            $sale = DigitalSale::with('provider')->findOrFail($id);
            $provider = Provider::findOrFail($input['provider_id']);

            // If provider changed, refund old provider and deduct from new provider
            if ($sale->provider_id != $input['provider_id']) {
                // Refund to old provider
                $oldProvider = Provider::findOrFail($sale->provider_id);
                $oldProvider->saldo += $sale->cost;
                $oldProvider->save();

                // Check new provider balance
                if ($provider->saldo < $input['cost']) {
                    throw new UnprocessableEntityHttpException(
                        'Insufficient provider balance. Required: ' . number_format($input['cost'], 2) .
                        ', Available: ' . number_format($provider->saldo, 2)
                    );
                }

                // Deduct from new provider
                $provider->saldo -= $input['cost'];
                $provider->save();
            } else {
                // Same provider, adjust balance if cost changed
                $costDifference = $input['cost'] - $sale->cost;

                if ($costDifference > 0) {
                    // Cost increased, need to check balance
                    if ($provider->saldo < $costDifference) {
                        throw new UnprocessableEntityHttpException(
                            'Insufficient provider balance for cost increase. Additional required: ' .
                            number_format($costDifference, 2) . ', Available: ' . number_format($provider->saldo, 2)
                        );
                    }
                    $provider->saldo -= $costDifference;
                } elseif ($costDifference < 0) {
                    // Cost decreased, refund difference
                    $provider->saldo -= $costDifference; // Subtract negative = add
                }

                $provider->save();
            }

            // Calculate margin
            $input['margin'] = $input['price'] - $input['cost'];

            // Update sale
            $sale->update($input);

            DB::commit();

            return $sale->fresh(['provider']);
        } catch (Exception $e) {
            DB::rollBack();
            throw new UnprocessableEntityHttpException($e->getMessage());
        }
    }

    /**
     * Delete a digital sale and refund provider balance
     *
     * @param int $id
     * @return bool
     * @throws Exception
     */
    public function deleteDigitalSale($id)
    {
        try {
            DB::beginTransaction();

            $sale = DigitalSale::findOrFail($id);

            // Refund provider balance
            $provider = Provider::findOrFail($sale->provider_id);
            $provider->saldo += $sale->cost;
            $provider->save();

            // Delete sale
            $sale->delete();

            DB::commit();

            return true;
        } catch (Exception $e) {
            DB::rollBack();
            throw new UnprocessableEntityHttpException($e->getMessage());
        }
    }
}
