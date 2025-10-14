<?php

namespace App\Console\Commands;

use App\Models\Store;
use App\Models\DigitalProvider;
use App\Models\StoreDigitalProvider;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class FixDigitalProviderConfigurations extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'digital:fix-provider-configurations {--tenant= : Tenant ID to fix} {--dry-run : Show what would be created without actually creating}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fix missing store digital provider configurations';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $tenantId = $this->option('tenant');
        $isDryRun = $this->option('dry-run');

        $this->info('Starting digital provider configuration fix...');

        if ($isDryRun) {
            $this->warn('DRY RUN MODE - No changes will be made');
        }

        // Get all stores
        $storesQuery = Store::query();
        if ($tenantId) {
            $storesQuery->where('tenant_id', $tenantId);
        }
        $stores = $storesQuery->get();

        // Get all digital providers
        $providers = DigitalProvider::where('is_active', true)->get();

        $this->info("Found {$stores->count()} stores and {$providers->count()} active providers");

        $createdCount = 0;
        $skippedCount = 0;

        foreach ($stores as $store) {
            foreach ($providers as $provider) {
                // Check if configuration already exists
                $existing = StoreDigitalProvider::where('tenant_id', $store->tenant_id)
                                              ->where('store_id', $store->id)
                                              ->where('digital_provider_id', $provider->id)
                                              ->first();

                if ($existing) {
                    $skippedCount++;
                    continue;
                }

                $this->info("Would create configuration for Store: {$store->name} (ID: {$store->id}), Provider: {$provider->name} (ID: {$provider->id}), Tenant: {$store->tenant_id}");

                if (!$isDryRun) {
                    try {
                        StoreDigitalProvider::create([
                            'tenant_id' => $store->tenant_id,
                            'store_id' => $store->id,
                            'digital_provider_id' => $provider->id,
                            'balance' => 0,
                            'is_active' => true,
                            'settings' => null,
                        ]);
                        $createdCount++;
                    } catch (\Exception $e) {
                        $this->error("Failed to create configuration: " . $e->getMessage());
                    }
                } else {
                    $createdCount++;
                }
            }
        }

        $this->info("Configuration fix complete!");
        $this->info("Configurations to create: {$createdCount}");
        $this->info("Configurations already existing: {$skippedCount}");

        if ($isDryRun) {
            $this->warn('Run without --dry-run to actually create the configurations');
        } else {
            $this->info('Successfully created configurations!');
        }

        return Command::SUCCESS;
    }
}