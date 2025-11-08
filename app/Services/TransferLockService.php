<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * Distributed Lock Service for Transfer Operations
 *
 * Prevents concurrent transfer operations that could cause:
 * - Double spending of stock
 * - Warehouse capacity violations
 * - Cross-tenant product sync conflicts
 * - Data inconsistency
 */
class TransferLockService
{
    private const LOCK_PREFIX = 'transfer_lock:';
    private const DEFAULT_TTL = 30; // 30 seconds
    private const RETRY_DELAY = 100; // 100ms
    private const MAX_RETRIES = 10;

    /**
     * Lock a product for transfer operations
     *
     * @param int $productId Product ID to lock
     * @param int $warehouseId Warehouse ID where product is located
     * @param string|int $tenantId Tenant ID for scope isolation
     * @param int $timeout Lock timeout in seconds
     * @return string Lock token
     * @throws Exception If lock cannot be acquired
     */
    public function lockProduct(int $productId, int $warehouseId, $tenantId, int $timeout = self::DEFAULT_TTL): string
    {
        $lockKey = $this->getProductLockKey($productId, $warehouseId, $tenantId);
        $token = $this->generateToken();

        Log::info("Attempting to acquire product lock", [
            'product_id' => $productId,
            'warehouse_id' => $warehouseId,
            'tenant_id' => $tenantId,
            'lock_key' => $lockKey,
            'token' => $token
        ]);

        if (!$this->acquireLock($lockKey, $token, $timeout)) {
            throw new Exception(
                "Cannot acquire lock for product {$productId} in warehouse {$warehouseId}. " .
                "Product is currently being transferred by another process."
            );
        }

        Log::info("Product lock acquired successfully", [
            'product_id' => $productId,
            'warehouse_id' => $warehouseId,
            'tenant_id' => $tenantId,
            'token' => $token
        ]);

        return $token;
    }

    /**
     * Lock warehouse for capacity checking
     *
     * @param int $warehouseId Warehouse ID to lock
     * @param string|int $tenantId Tenant ID for scope isolation
     * @param int $timeout Lock timeout in seconds
     * @return string Lock token
     * @throws Exception If lock cannot be acquired
     */
    public function lockWarehouse(int $warehouseId, $tenantId, int $timeout = self::DEFAULT_TTL): string
    {
        $lockKey = $this->getWarehouseLockKey($warehouseId, $tenantId);
        $token = $this->generateToken();

        Log::info("Attempting to acquire warehouse lock", [
            'warehouse_id' => $warehouseId,
            'tenant_id' => $tenantId,
            'lock_key' => $lockKey,
            'token' => $token
        ]);

        if (!$this->acquireLock($lockKey, $token, $timeout)) {
            throw new Exception(
                "Cannot acquire lock for warehouse {$warehouseId}. " .
                "Warehouse is currently being updated by another transfer process."
            );
        }

        Log::info("Warehouse lock acquired successfully", [
            'warehouse_id' => $warehouseId,
            'tenant_id' => $tenantId,
            'token' => $token
        ]);

        return $token;
    }

    /**
     * Lock product for cross-tenant sync operations
     *
     * @param string $productCode Product code to lock
     * @param string|int $targetTenantId Target tenant ID
     * @param int $timeout Lock timeout in seconds
     * @return string Lock token
     * @throws Exception If lock cannot be acquired
     */
    public function lockProductForSync(string $productCode, $targetTenantId, int $timeout = self::DEFAULT_TTL): string
    {
        $lockKey = $this->getProductSyncLockKey($productCode, $targetTenantId);
        $token = $this->generateToken();

        Log::info("Attempting to acquire product sync lock", [
            'product_code' => $productCode,
            'target_tenant_id' => $targetTenantId,
            'lock_key' => $lockKey,
            'token' => $token
        ]);

        if (!$this->acquireLock($lockKey, $token, $timeout)) {
            throw new Exception(
                "Cannot acquire sync lock for product code '{$productCode}' in tenant {$targetTenantId}. " .
                "Product is currently being synced by another process."
            );
        }

        Log::info("Product sync lock acquired successfully", [
            'product_code' => $productCode,
            'target_tenant_id' => $targetTenantId,
            'token' => $token
        ]);

        return $token;
    }

    /**
     * Release a lock
     *
     * @param string $lockKey Lock key to release
     * @param string $token Lock token for verification
     * @return bool True if lock was released
     */
    public function releaseLock(string $lockKey, string $token): bool
    {
        // Check cache driver compatibility
        $cacheDriver = config('cache.default');
        if ($cacheDriver === 'array') {
            Log::debug("Skipping lock release for incompatible cache driver: {$cacheDriver}", [
                'lock_key' => $lockKey
            ]);
            return true; // Skip for incompatible drivers
        }

        try {
            // Ensure only the lock owner can release it
            $storedToken = Cache::get($lockKey);

            if ($storedToken !== $token) {
                Log::warning("Attempted to release lock with invalid token", [
                    'lock_key' => $lockKey,
                    'provided_token' => $token,
                    'stored_token' => $storedToken,
                    'cache_driver' => $cacheDriver
                ]);
                return false;
            }

            $released = Cache::forget($lockKey);

            if ($released) {
                Log::info("Lock released successfully", [
                    'lock_key' => $lockKey,
                    'token' => $token,
                    'cache_driver' => $cacheDriver
                ]);
            } else {
                Log::warning("Failed to release lock", [
                    'lock_key' => $lockKey,
                    'token' => $token,
                    'cache_driver' => $cacheDriver
                ]);
            }

            return $released;

        } catch (Exception $e) {
            Log::error("Cache operation failed during lock release", [
                'lock_key' => $lockKey,
                'error' => $e->getMessage(),
                'cache_driver' => $cacheDriver
            ]);

            // For development with file cache, allow operation to succeed
            if ($cacheDriver === 'file') {
                Log::info("File cache detected - allowing lock release to succeed", [
                    'lock_key' => $lockKey
                ]);
                return true;
            }

            return false;
        }
    }

    /**
     * Acquire lock with retry mechanism
     *
     * @param string $lockKey Lock key
     * @param string $token Lock token
     * @param int $timeout Lock timeout
     * @param int $maxRetries Maximum retry attempts
     * @return bool True if lock acquired
     */
    private function acquireLock(string $lockKey, string $token, int $timeout, int $maxRetries = self::MAX_RETRIES): bool
    {
        // Check cache driver compatibility
        $cacheDriver = config('cache.default');
        if ($cacheDriver === 'array') {
            Log::warning("Incompatible cache driver for locking: {$cacheDriver}. Locking will be skipped.", [
                'lock_key' => $lockKey,
                'recommended_driver' => 'redis'
            ]);
            return true; // Skip locking for incompatible drivers
        }

        for ($attempt = 1; $attempt <= $maxRetries; $attempt++) {
            try {
                // Try to acquire lock atomically
                if (Cache::add($lockKey, $token, $timeout)) {
                    return true;
                }
            } catch (Exception $e) {
                Log::error("Cache operation failed during lock acquisition", [
                    'lock_key' => $lockKey,
                    'attempt' => $attempt,
                    'error' => $e->getMessage(),
                    'cache_driver' => $cacheDriver
                ]);

                // For development with file cache, allow operation to proceed
                if ($cacheDriver === 'file' && $attempt === 1) {
                    Log::info("File cache detected - allowing operation to proceed without locking", [
                        'lock_key' => $lockKey
                    ]);
                    return true;
                }

                return false;
            }

            // If this is not the last attempt, wait and retry
            if ($attempt < $maxRetries) {
                Log::info("Lock acquisition attempt failed, retrying", [
                    'lock_key' => $lockKey,
                    'attempt' => $attempt,
                    'max_retries' => $maxRetries
                ]);

                usleep(self::RETRY_DELAY * 1000); // Convert to microseconds
            }
        }

        Log::warning("Failed to acquire lock after maximum retries", [
            'lock_key' => $lockKey,
            'max_retries' => $maxRetries,
            'cache_driver' => $cacheDriver
        ]);

        return false;
    }

    /**
     * Generate unique lock token
     *
     * @return string Unique token
     */
    private function generateToken(): string
    {
        return Str::random(32) . '_' . time();
    }

    /**
     * Get product lock key
     *
     * @param int $productId Product ID
     * @param int $warehouseId Warehouse ID
     * @param string|int $tenantId Tenant ID
     * @return string Lock key
     */
    private function getProductLockKey(int $productId, int $warehouseId, $tenantId): string
    {
        return self::LOCK_PREFIX . "product:{$productId}:warehouse:{$warehouseId}:tenant:{$tenantId}";
    }

    /**
     * Get warehouse lock key
     *
     * @param int $warehouseId Warehouse ID
     * @param string|int $tenantId Tenant ID
     * @return string Lock key
     */
    private function getWarehouseLockKey(int $warehouseId, $tenantId): string
    {
        return self::LOCK_PREFIX . "warehouse:{$warehouseId}:tenant:{$tenantId}";
    }

    /**
     * Get product sync lock key
     *
     * @param string $productCode Product code
     * @param string|int $targetTenantId Target tenant ID
     * @return string Lock key
     */
    private function getProductSyncLockKey(string $productCode, $targetTenantId): string
    {
        return self::LOCK_PREFIX . "sync:product:{$productCode}:tenant:{$targetTenantId}";
    }

    /**
     * Get active locks information (for debugging/admin)
     *
     * @return array Active locks information
     */
    public function getActiveLocksInfo(): array
    {
        // Note: This is a simplified approach. In production, you might want
        // to use Redis SCAN or maintain a separate index of active locks

        return [
            'cache_driver' => config('cache.default'),
            'lock_prefix' => self::LOCK_PREFIX,
            'note' => 'Use Redis CLI or admin tools to inspect active locks'
        ];
    }

    /**
     * Clean up expired locks (maintenance operation)
     *
     * @return int Number of locks cleaned up
     */
    public function cleanupExpiredLocks(): int
    {
        // This would require implementing a lock registry or using Redis SCAN
        // For now, we rely on cache TTL to automatically expire locks

        Log::info("Lock cleanup completed - relying on cache TTL for automatic expiration");

        return 0;
    }
}