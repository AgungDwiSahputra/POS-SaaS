# Distributed Locking Guide for Transfer System

## Overview

The transfer system now includes distributed locking to prevent concurrent operations that could cause data inconsistency, double spending, or capacity violations.

## Lock Types

### 1. Product Lock
- **Purpose**: Prevents concurrent transfers of the same product from the same warehouse
- **Scope**: `product:{product_id}:warehouse:{warehouse_id}:tenant:{tenant_id}`
- **Duration**: 30 seconds (configurable)
- **Use Case**: Multiple users trying to transfer Product X from Warehouse A simultaneously

### 2. Warehouse Lock
- **Purpose**: Prevents concurrent operations on warehouse capacity calculations
- **Scope**: `warehouse:{warehouse_id}:tenant:{tenant_id}`
- **Duration**: 30 seconds (configurable)
- **Use Case**: Multiple transfers to the same warehouse with capacity limits

### 3. Product Sync Lock
- **Purpose**: Prevents concurrent product synchronization to the same tenant
- **Scope**: `sync:product:{product_code}:tenant:{target_tenant_id}`
- **Duration**: 30 seconds (configurable)
- **Use Case**: Multiple users trying to sync the same product to the same tenant

## Configuration Requirements

### Cache Configuration
The locking system relies on Laravel's cache driver. **Redis is strongly recommended** for production environments.

#### Redis Configuration (.env)
```env
CACHE_DRIVER=redis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
```

#### Alternative Cache Drivers
- **File**: Suitable for development/single server
- **Database**: Not recommended (performance overhead)
- **Memcached**: Alternative to Redis

#### Warning: Do NOT use
- `array` driver - Not persistent across requests
- `apc` driver - Limited to single server

## Lock Behavior

### Lock Acquisition
- Uses atomic `Cache::add()` operation
- Implements retry mechanism (10 attempts, 100ms delay)
- Returns unique token for verification

### Lock Release
- Requires original token for security
- Only lock owner can release
- Automatic expiration based on TTL

### Error Scenarios
1. **Lock Conflict**: User-friendly error message returned
2. **Lock Timeout**: Lock expires automatically after TTL
3. **Release Failure**: Logged but doesn't crash the application

## Implementation Details

### Lock Acquisition Flow
```php
try {
    $lockToken = $lockService->lockProduct($productId, $warehouseId, $tenantId);
    // Perform transfer operation
} catch (Exception $e) {
    // Handle lock conflict
} finally {
    $lockService->releaseLock($lockKey, $lockToken);
}
```

### Batch Locking in Transfers
The system acquires all required locks before processing:

1. **Pre-Locking Phase**: Lock all products and warehouse
2. **Validation Phase**: Check stock, capacity, etc.
3. **Processing Phase**: Perform sync, stock movement, HPP calculation
4. **Cleanup Phase**: Release all locks (success or failure)

## Performance Considerations

### Lock Granularity
- **Product-level**: Most granular, prevents double spending
- **Warehouse-level**: Coarser, prevents capacity violations
- **Sync-level**: Prevents duplicate product creation

### Lock Duration
- **Default**: 30 seconds
- **Adjustable**: Per-operation basis
- **Automatic**: Expire even if not released

### Deadlock Prevention
- **Consistent Ordering**: Acquire locks in predictable order
- **Reverse Release**: Release locks in reverse acquisition order
- **Timeout**: Automatic expiration prevents permanent deadlocks

## Monitoring & Debugging

### Log Events
The system logs all lock operations:
- Lock acquisition attempts
- Success/failure of lock acquisition
- Lock release events
- Errors during lock operations

### Active Locks Inspection
```php
$lockInfo = $lockService->getActiveLocksInfo();
```

### Redis CLI Commands
```bash
# List all transfer locks
redis-cli --scan --pattern "transfer_lock:*"

# Check specific lock
redis-cli GET "transfer_lock:product:123:warehouse:45:tenant:1"

# Monitor lock operations
redis-cli MONITOR | grep "transfer_lock"
```

## Testing

### Unit Tests
- Lock acquisition and release
- Timeout behavior
- Conflict detection
- Error handling

### Integration Tests
- Concurrent transfer scenarios
- Cross-tenant sync conflicts
- Warehouse capacity violations

### Performance Tests
- Lock acquisition speed
- Memory usage
- Cache hit rates

## Production Deployment Checklist

### Cache Setup
- [ ] Redis server installed and running
- [ ] Proper Redis configuration (memory, persistence)
- [ ] Laravel cache configuration updated
- [ ] Redis connection testing

### Application Configuration
- [ ] Appropriate lock timeouts configured
- [ ] Error messages translated for all languages
- [ ] Monitoring dashboards for lock metrics
- [ ] Alert configuration for lock timeouts

### Performance Monitoring
- [ ] Cache hit rate monitoring
- [ ] Lock acquisition time tracking
- [ ] Error rate monitoring
- [ ] Resource usage tracking

## Troubleshooting

### Common Issues

#### "Cannot acquire lock" Errors
- **Cause**: Another process holds the lock
- **Solution**: Wait and retry, or check for stuck processes
- **Prevention**: Increase lock timeout or optimize operations

#### High Lock Wait Times
- **Cause**: Slow operations holding locks too long
- **Solution**: Optimize transfer processing time
- **Prevention**: Break down large transfers

#### Redis Connection Issues
- **Cause**: Network or configuration problems
- **Solution**: Check Redis connectivity and settings
- **Prevention**: Use Redis Sentinel or Cluster for HA

### Emergency Procedures

#### Clearing Stuck Locks
```bash
# Clear all transfer locks (emergency only)
redis-cli --scan --pattern "transfer_lock:*" | xargs redis-cli DEL
```

#### Force Release
```php
// Emergency lock release (bypass token verification)
Cache::forget($lockKey);
```

## Best Practices

### Application Design
- Keep operations holding locks as short as possible
- Implement proper error handling and cleanup
- Use appropriate lock granularity
- Monitor lock metrics continuously

### Operations
- Monitor for lock timeouts and errors
- Have emergency procedures for stuck locks
- Regular Redis maintenance
- Capacity planning for cache memory

### Security
- Use unique tokens for lock verification
- Implement proper access controls
- Log all lock operations
- Regular security audits of lock usage