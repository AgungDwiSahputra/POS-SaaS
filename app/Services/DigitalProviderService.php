<?php

namespace App\Services;

use App\Models\DigitalProduct;
use App\Models\DigitalProvider;
use App\Models\DigitalSale;
use App\Models\StoreDigitalProvider;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class DigitalProviderService
{
    /**
     * Execute digital product transaction with external provider
     */
    public function executeTransaction(
        DigitalSale $sale,
        DigitalProduct $product,
        DigitalProvider $provider,
        StoreDigitalProvider $storeProvider
    ): array {
        $result = [
            'success' => false,
            'message' => 'Transaction failed',
            'provider_transaction_id' => null,
            'customer_transaction_id' => null,
            'data' => null,
        ];

        try {
            // Get provider configuration
            $config = $provider->settings ?? [];

            if (empty($config['api_endpoint']) || empty($config['api_key'])) {
                $result['message'] = 'Provider configuration incomplete';
                return $result;
            }

            // Prepare request data based on product category
            $requestData = $this->prepareRequestData($sale, $product, $provider);

            // Execute transaction with provider
            $response = Http::timeout(30)
                ->withHeaders([
                    'Authorization' => 'Bearer ' . $config['api_key'],
                    'Content-Type' => 'application/json',
                    'Accept' => 'application/json',
                ])
                ->post($config['api_endpoint'] . '/transaction', $requestData);

            if ($response->successful()) {
                $responseData = $response->json();

                $result = [
                    'success' => true,
                    'message' => 'Transaction successful',
                    'provider_transaction_id' => $responseData['transaction_id'] ?? null,
                    'customer_transaction_id' => $responseData['customer_transaction_id'] ?? null,
                    'data' => $responseData,
                ];

                Log::info('Digital product transaction successful', [
                    'sale_id' => $sale->id,
                    'provider' => $provider->name,
                    'product' => $product->name,
                    'response' => $responseData,
                ]);
            } else {
                $errorData = $response->json();
                $result['message'] = $errorData['message'] ?? 'Provider returned error';

                Log::warning('Digital product transaction failed', [
                    'sale_id' => $sale->id,
                    'provider' => $provider->name,
                    'product' => $product->name,
                    'status_code' => $response->status(),
                    'error' => $errorData,
                ]);
            }

        } catch (RequestException $e) {
            $result['message'] = 'Network error: ' . $e->getMessage();

            Log::error('Digital product transaction network error', [
                'sale_id' => $sale->id,
                'provider' => $provider->name,
                'product' => $product->name,
                'error' => $e->getMessage(),
            ]);
        } catch (\Exception $e) {
            $result['message'] = 'Unexpected error: ' . $e->getMessage();

            Log::error('Digital product transaction unexpected error', [
                'sale_id' => $sale->id,
                'provider' => $provider->name,
                'product' => $product->name,
                'error' => $e->getMessage(),
            ]);
        }

        return $result;
    }

    /**
     * Check transaction status with provider
     */
    public function checkTransactionStatus(
        string $providerTransactionId,
        DigitalProvider $provider
    ): array {
        $result = [
            'success' => false,
            'status' => 'unknown',
            'message' => 'Status check failed',
        ];

        try {
            $config = $provider->settings ?? [];

            $response = Http::timeout(15)
                ->withHeaders([
                    'Authorization' => 'Bearer ' . $config['api_key'],
                    'Content-Type' => 'application/json',
                ])
                ->get($config['api_endpoint'] . '/transaction/' . $providerTransactionId);

            if ($response->successful()) {
                $responseData = $response->json();

                $result = [
                    'success' => true,
                    'status' => $responseData['status'] ?? 'unknown',
                    'message' => $responseData['message'] ?? 'Status retrieved',
                ];
            }

        } catch (\Exception $e) {
            $result['message'] = 'Status check error: ' . $e->getMessage();

            Log::error('Transaction status check failed', [
                'provider_transaction_id' => $providerTransactionId,
                'provider' => $provider->name,
                'error' => $e->getMessage(),
            ]);
        }

        return $result;
    }

    /**
     * Prepare request data based on product category
     */
    private function prepareRequestData(DigitalSale $sale, DigitalProduct $product, DigitalProvider $provider): array
    {
        $baseData = [
            'product_code' => $product->product_code,
            'customer_phone' => $sale->customer_phone,
            'amount' => $sale->sell_price,
            'reference' => $sale->reference_code,
        ];

        // Add category-specific data
        switch ($product->category) {
            case 'pulsa':
                return array_merge($baseData, [
                    'type' => 'pulsa',
                    'nominal' => $product->sell_price,
                ]);

            case 'paket_data':
                return array_merge($baseData, [
                    'type' => 'data_package',
                    'package_type' => $product->product_data['package_type'] ?? 'regular',
                ]);

            case 'token':
                return array_merge($baseData, [
                    'type' => 'electric_token',
                    'meter_number' => $sale->customer_phone, // Assuming phone is meter number for token
                ]);

            case 'game':
                return array_merge($baseData, [
                    'type' => 'game_voucher',
                    'game_name' => $product->product_data['game_name'] ?? 'general',
                ]);

            default:
                return $baseData;
        }
    }

    /**
     * Retry failed transaction
     */
    public function retryTransaction(DigitalSale $sale): array
    {
        // Get related models
        $product = $sale->digitalProduct;
        $provider = $sale->digitalProvider;
        $storeProvider = $sale->storeDigitalProvider;

        if (!$product || !$provider || !$storeProvider) {
            return [
                'success' => false,
                'message' => 'Related data not found',
            ];
        }

        // Check if balance is still sufficient
        if (!$storeProvider->hasSufficientBalance($sale->cost_price)) {
            return [
                'success' => false,
                'message' => 'Insufficient balance for retry',
            ];
        }

        return $this->executeTransaction($sale, $product, $provider, $storeProvider);
    }
}