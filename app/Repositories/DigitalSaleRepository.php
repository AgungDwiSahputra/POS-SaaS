<?php

namespace App\Repositories;

use App\Models\DigitalSale;
use App\Models\DigitalSaleItem;
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

            // Get items from input
            $items = $input['items'] ?? [];

            if (empty($items)) {
                throw new UnprocessableEntityHttpException('At least one item is required.');
            }

            // Calculate totals from items
            $totalCost = 0;
            $totalPrice = 0;
            foreach ($items as $item) {
                $totalCost += $item['cost'] * $item['quantity'];
                $totalPrice += $item['price'] * $item['quantity'];
            }

            // Override cost and price with calculated totals
            $input['cost'] = $totalCost;
            $input['price'] = $totalPrice;

            // Get provider
            $provider = Provider::findOrFail($input['provider_id']);

            // Calculate margin
            $input['margin'] = $totalPrice - $totalCost;

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

            // Create digital sale items
            foreach ($items as $item) {
                DigitalSaleItem::create([
                    'digital_sale_id' => $sale->id,
                    'digital_product_id' => $item['digital_product_id'],
                    'product_price' => $item['price'],
                    'quantity' => $item['quantity'],
                    'sub_total' => $item['price'] * $item['quantity'],
                ]);
            }

            // Cek type dari digital products
            $productTypes = [];
            foreach ($items as $item) {
                $product = \App\Models\DigitalProduct::findOrFail($item['digital_product_id']);
                $productTypes[] = $product->type;
            }

            // Tentukan apakah semua items adalah tarik_tunai
            $allTarikTunai = !empty($productTypes) && count(array_unique($productTypes)) === 1 && $productTypes[0] === 'tarik_tunai';

            // Update saldo berdasarkan type
            if ($allTarikTunai) {
                // Tarik tunai: saldo bertambah
                $provider->saldo += $totalCost;
            } else {
                // Setor tunai: saldo berkurang (validasi saldo tetap diperlukan)
                if ($provider->saldo < $totalCost) {
                    throw new UnprocessableEntityHttpException(
                        'Insufficient provider balance. Required: ' . number_format($totalCost, 2) .
                        ', Available: ' . number_format($provider->saldo, 2)
                    );
                }
                $provider->saldo -= $totalCost;
            }
            $provider->save();

            DB::commit();

            return $sale->fresh(['provider', 'digitalSaleItems.digitalProduct']);
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

            $sale = DigitalSale::with(['provider', 'digitalSaleItems'])->findOrFail($id);

            // Get items from input
            $items = $input['items'] ?? [];

            if (empty($items)) {
                throw new UnprocessableEntityHttpException('At least one item is required.');
            }

            // Calculate totals from items
            $totalCost = 0;
            $totalPrice = 0;
            foreach ($items as $item) {
                $totalCost += $item['cost'] * $item['quantity'];
                $totalPrice += $item['price'] * $item['quantity'];
            }

            // Override cost and price with calculated totals
            $input['cost'] = $totalCost;
            $input['price'] = $totalPrice;

            $provider = Provider::findOrFail($input['provider_id']);

            // Cek type dari digital products (baru dan lama)
            $newProductTypes = [];
            foreach ($items as $item) {
                $product = \App\Models\DigitalProduct::findOrFail($item['digital_product_id']);
                $newProductTypes[] = $product->type;
            }

            $oldProductTypes = [];
            foreach ($sale->digitalSaleItems as $item) {
                $oldProductTypes[] = $item->digitalProduct->type;
            }

            $allNewTarikTunai = !empty($newProductTypes) && count(array_unique($newProductTypes)) === 1 && $newProductTypes[0] === 'tarik_tunai';
            $allOldTarikTunai = !empty($oldProductTypes) && count(array_unique($oldProductTypes)) === 1 && $oldProductTypes[0] === 'tarik_tunai';

            // Jika provider berubah
            if ($sale->provider_id != $input['provider_id']) {
                // Refund ke old provider berdasarkan type lama
                $oldProvider = Provider::findOrFail($sale->provider_id);
                if ($allOldTarikTunai) {
                    // Tarik tunai: refund dengan mengurangi saldo
                    $oldProvider->saldo -= $sale->cost;
                } else {
                    // Setor tunai: refund dengan menambah saldo
                    $oldProvider->saldo += $sale->cost;
                }
                $oldProvider->save();

                // Update new provider berdasarkan type baru
                if ($allNewTarikTunai) {
                    // Tarik tunai: saldo bertambah (tidak perlu validasi)
                    $provider->saldo += $totalCost;
                } else {
                    // Setor tunai: saldo berkurang (validasi saldo diperlukan)
                    if ($provider->saldo < $totalCost) {
                        throw new UnprocessableEntityHttpException(
                            'Insufficient provider balance. Required: ' . number_format($totalCost, 2) .
                            ', Available: ' . number_format($provider->saldo, 2)
                        );
                    }
                    $provider->saldo -= $totalCost;
                }
                $provider->save();
            } else {
                // Provider sama, adjust saldo berdasarkan perubahan cost dan type
                $costDifference = $totalCost - $sale->cost;
                
                if ($allNewTarikTunai && $allOldTarikTunai) {
                    // Keduanya tarik_tunai: adjust saldo dengan menambah selisih
                    $provider->saldo += $costDifference;
                } elseif (!$allNewTarikTunai && !$allOldTarikTunai) {
                    // Keduanya setor_tunai: adjust saldo dengan mengurangi selisih
                    if ($costDifference > 0) {
                        if ($provider->saldo < $costDifference) {
                            throw new UnprocessableEntityHttpException(
                                'Insufficient provider balance for cost increase. Additional required: ' .
                                number_format($costDifference, 2) . ', Available: ' . number_format($provider->saldo, 2)
                            );
                        }
                        $provider->saldo -= $costDifference;
                    } elseif ($costDifference < 0) {
                        $provider->saldo -= $costDifference; // Subtract negative = add
                    }
                } else {
                    // Type berubah: refund old cost, apply new cost
                    if ($allOldTarikTunai) {
                        // Refund tarik tunai: kurangi saldo
                        $provider->saldo -= $sale->cost;
                    } else {
                        // Refund setor tunai: tambah saldo
                        $provider->saldo += $sale->cost;
                    }
                    
                    if ($allNewTarikTunai) {
                        // Apply tarik tunai: tambah saldo
                        $provider->saldo += $totalCost;
                    } else {
                        // Apply setor tunai: kurangi saldo
                        if ($provider->saldo < $totalCost) {
                            throw new UnprocessableEntityHttpException(
                                'Insufficient provider balance. Required: ' . number_format($totalCost, 2) .
                                ', Available: ' . number_format($provider->saldo, 2)
                            );
                        }
                        $provider->saldo -= $totalCost;
                    }
                }
                
                $provider->save();
            }

            // Calculate margin
            $input['margin'] = $totalPrice - $totalCost;

            // Update sale
            $sale->update($input);

            // Delete old items and create new ones
            DigitalSaleItem::where('digital_sale_id', $sale->id)->delete();

            foreach ($items as $item) {
                DigitalSaleItem::create([
                    'digital_sale_id' => $sale->id,
                    'digital_product_id' => $item['digital_product_id'],
                    'product_price' => $item['price'],
                    'quantity' => $item['quantity'],
                    'sub_total' => $item['price'] * $item['quantity'],
                ]);
            }

            DB::commit();

            return $sale->fresh(['provider', 'digitalSaleItems.digitalProduct']);
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

            $sale = DigitalSale::with(['digitalSaleItems'])->findOrFail($id);

            // Refund provider balance berdasarkan type
            $provider = Provider::findOrFail($sale->provider_id);

            // Cek type dari digital products
            $productTypes = [];
            foreach ($sale->digitalSaleItems as $item) {
                $productTypes[] = $item->digitalProduct->type;
            }

            $allTarikTunai = !empty($productTypes) && count(array_unique($productTypes)) === 1 && $productTypes[0] === 'tarik_tunai';

            if ($allTarikTunai) {
                // Tarik tunai: refund dengan mengurangi saldo
                $provider->saldo -= $sale->cost;
            } else {
                // Setor tunai: refund dengan menambah saldo
                $provider->saldo += $sale->cost;
            }
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
