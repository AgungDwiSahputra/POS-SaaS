<?php

namespace Database\Seeders;

use App\Models\DigitalProduct;
use App\Models\DigitalProvider;
use Illuminate\Database\Seeder;

class DigitalProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create sample digital providers
        $providers = [
            [
                'name' => 'Telkomsel',
                'code' => 'TELKOMSEL',
                'description' => 'Provider pulsa dan paket data Telkomsel',
                'logo' => 'telkomsel.png',
                'is_active' => true,
                'settings' => [
                    'api_endpoint' => 'https://api.telkomsel.com',
                    'api_key' => 'your-telkomsel-api-key',
                ],
            ],
            [
                'name' => 'Indosat Ooredoo',
                'code' => 'INDOSAT',
                'description' => 'Provider pulsa dan paket data Indosat',
                'logo' => 'indosat.png',
                'is_active' => true,
                'settings' => [
                    'api_endpoint' => 'https://api.indosat.com',
                    'api_key' => 'your-indosat-api-key',
                ],
            ],
            [
                'name' => 'XL Axiata',
                'code' => 'XL',
                'description' => 'Provider pulsa dan paket data XL',
                'logo' => 'xl.png',
                'is_active' => true,
                'settings' => [
                    'api_endpoint' => 'https://api.xl.co.id',
                    'api_key' => 'your-xl-api-key',
                ],
            ],
            [
                'name' => 'Tri (3)',
                'code' => 'TRI',
                'description' => 'Provider pulsa dan paket data Tri',
                'logo' => 'tri.png',
                'is_active' => true,
                'settings' => [
                    'api_endpoint' => 'https://api.tri.co.id',
                    'api_key' => 'your-tri-api-key',
                ],
            ],
            [
                'name' => 'Smartfren',
                'code' => 'SMARTFREN',
                'description' => 'Provider pulsa dan paket data Smartfren',
                'logo' => 'smartfren.png',
                'is_active' => true,
                'settings' => [
                    'api_endpoint' => 'https://api.smartfren.com',
                    'api_key' => 'your-smartfren-api-key',
                ],
            ],
            [
                'name' => 'PLN Token',
                'code' => 'PLN',
                'description' => 'Token listrik PLN',
                'logo' => 'pln.png',
                'is_active' => true,
                'settings' => [
                    'api_endpoint' => 'https://api.pln.co.id',
                    'api_key' => 'your-pln-api-key',
                ],
            ],
            [
                'name' => 'Steam Wallet',
                'code' => 'STEAM',
                'description' => 'Voucher game Steam',
                'logo' => 'steam.png',
                'is_active' => true,
                'settings' => [
                    'api_endpoint' => 'https://api.steam.com',
                    'api_key' => 'your-steam-api-key',
                ],
            ],
        ];

        foreach ($providers as $provider) {
            DigitalProvider::create($provider);
        }

        // Create sample digital products
        $products = [
            // Pulsa products
            [
                'name' => 'Pulsa 5.000',
                'code' => 'PULSA_5K',
                'product_code' => 'PULSA_5K',
                'description' => 'Pulsa nominal 5.000',
                'category' => 'pulsa',
                'cost_price' => 4750,
                'sell_price' => 5000,
                'provider_code' => 'P5K',
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'name' => 'Pulsa 10.000',
                'code' => 'PULSA_10K',
                'product_code' => 'PULSA_10K',
                'description' => 'Pulsa nominal 10.000',
                'category' => 'pulsa',
                'cost_price' => 9500,
                'sell_price' => 10000,
                'provider_code' => 'P10K',
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'Pulsa 25.000',
                'code' => 'PULSA_25K',
                'product_code' => 'PULSA_25K',
                'description' => 'Pulsa nominal 25.000',
                'category' => 'pulsa',
                'cost_price' => 23750,
                'sell_price' => 25000,
                'provider_code' => 'P25K',
                'is_active' => true,
                'sort_order' => 3,
            ],
            [
                'name' => 'Pulsa 50.000',
                'code' => 'PULSA_50K',
                'product_code' => 'PULSA_50K',
                'description' => 'Pulsa nominal 50.000',
                'category' => 'pulsa',
                'cost_price' => 47500,
                'sell_price' => 50000,
                'provider_code' => 'P50K',
                'is_active' => true,
                'sort_order' => 4,
            ],
            [
                'name' => 'Pulsa 100.000',
                'code' => 'PULSA_100K',
                'product_code' => 'PULSA_100K',
                'description' => 'Pulsa nominal 100.000',
                'category' => 'pulsa',
                'cost_price' => 95000,
                'sell_price' => 100000,
                'provider_code' => 'P100K',
                'is_active' => true,
                'sort_order' => 5,
            ],

            // Paket data products
            [
                'name' => 'Paket Data 1GB',
                'code' => 'DATA_1GB',
                'product_code' => 'DATA_1GB',
                'description' => 'Paket data 1GB 30 hari',
                'category' => 'paket_data',
                'cost_price' => 9500,
                'sell_price' => 10000,
                'provider_code' => 'D1GB',
                'is_active' => true,
                'sort_order' => 6,
            ],
            [
                'name' => 'Paket Data 5GB',
                'code' => 'DATA_5GB',
                'product_code' => 'DATA_5GB',
                'description' => 'Paket data 5GB 30 hari',
                'category' => 'paket_data',
                'cost_price' => 47500,
                'sell_price' => 50000,
                'provider_code' => 'D5GB',
                'is_active' => true,
                'sort_order' => 7,
            ],
            [
                'name' => 'Paket Data 10GB',
                'code' => 'DATA_10GB',
                'product_code' => 'DATA_10GB',
                'description' => 'Paket data 10GB 30 hari',
                'category' => 'paket_data',
                'cost_price' => 95000,
                'sell_price' => 100000,
                'provider_code' => 'D10GB',
                'is_active' => true,
                'sort_order' => 8,
            ],

            // Token listrik products
            [
                'name' => 'Token Listrik 20.000',
                'code' => 'TOKEN_20K',
                'product_code' => 'TOKEN_20K',
                'description' => 'Token listrik nominal 20.000',
                'category' => 'token',
                'cost_price' => 19000,
                'sell_price' => 20000,
                'provider_code' => 'T20K',
                'is_active' => true,
                'sort_order' => 9,
            ],
            [
                'name' => 'Token Listrik 50.000',
                'code' => 'TOKEN_50K',
                'product_code' => 'TOKEN_50K',
                'description' => 'Token listrik nominal 50.000',
                'category' => 'token',
                'cost_price' => 47500,
                'sell_price' => 50000,
                'provider_code' => 'T50K',
                'is_active' => true,
                'sort_order' => 10,
            ],

            // Game voucher products
            [
                'name' => 'Steam Wallet 50.000',
                'code' => 'STEAM_50K',
                'product_code' => 'STEAM_50K',
                'description' => 'Steam Wallet nominal 50.000',
                'category' => 'game',
                'cost_price' => 47500,
                'sell_price' => 50000,
                'provider_code' => 'SW50K',
                'is_active' => true,
                'sort_order' => 11,
            ],
            [
                'name' => 'Steam Wallet 100.000',
                'code' => 'STEAM_100K',
                'product_code' => 'STEAM_100K',
                'description' => 'Steam Wallet nominal 100.000',
                'category' => 'game',
                'cost_price' => 95000,
                'sell_price' => 100000,
                'provider_code' => 'SW100K',
                'is_active' => true,
                'sort_order' => 12,
            ],
        ];

        foreach ($products as $product) {
            DigitalProduct::create($product);
        }
    }
}