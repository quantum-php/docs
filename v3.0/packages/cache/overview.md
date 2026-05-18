# Caching in Quantum Framework

Quantum PHP provides a flexible caching layer to optimize application performance. The caching system is implemented using `CacheFactory`, which handles adapter selection and caching logic.

## Cache Helper Flow

The `cache()` function is the primary entry point for interacting with the cache system. It resolves to a `Cache` instance managed by the `CacheFactory`. The flow is as follows:

1. **Adapter Resolution Order**:
   - Takes an optional `$adapter` argument; if none is provided, uses `cache.default` from configuration.
   - Resolves an adapter class using `CacheFactory::ADAPTERS` lookup.
   - Instantiates the adapter if not already cached locally.

## Adapter Instances

The cache factory supports multiple adapters:
- **FileAdapter**: Local filesystem-based caching.
- **DatabaseAdapter**: Uses database tables for caching.
- **MemcachedAdapter**: Connects to Memcached servers.
- **RedisAdapter**: Interfaces with Redis instances.

For efficiency, `CacheFactory` maintains an internal instance cache for each adapter, ensuring the same adapter isn't repeatedly instantiated within the request lifecycle.

## Quantum\Cache\Cache Behavior

The `Cache` facade provides methods that map to `PSR CacheInterface` methods:
- **get**
- **set**
- **delete**, etc.

If a method is invoked that the adapter does not support, `Cache::methodNotSupported` exception is thrown, promoting error transparency.

```php
// Example usage:
$cache = cache('redis');  // Resolves redis adapter
$cache->set('key', 'value', 3600); // Set cache with a TTL
$value = $cache->get('key');  // Retrieve cached value
```

The caching layer design offers flexibility to switch between built-in storage solutions, with minimal configuration changes.