# Cache Contracts

This page defines the cache behavior application code can rely on.

## Helper and factory contract

Use the helper as the standard entry point.

```php
$cache = cache();
$redis = cache('redis');
```

Resolution rules:

- an explicit adapter name wins
- otherwise the factory uses `cache.default`
- supported adapter names are `file`, `database`, `memcached`, and `redis`
- unknown adapter names fail during resolution with a cache exception

`CacheFactory::get()` lazily registers itself in DI and reuses one `Cache` wrapper per adapter name.

## Wrapper contract

`cache()` returns `Quantum\Cache\Cache`, which forwards calls to the active adapter.

Supported public methods are the PSR-16 style methods implemented by the adapters:

- `get($key, $default = null)`
- `getMultiple($keys, $default = null)`
- `has($key)`
- `set($key, $value, $ttl = null)`
- `setMultiple($values, $ttl = null)`
- `delete($key)`
- `deleteMultiple($keys)`
- `clear()`

Calling a method the adapter does not implement throws `CacheException::methodNotSupported(...)`.

## Key contract

All built-in adapters transform the runtime key with:

```text
sha1(<prefix> . <key>)
```

Practical effect:

- changing `prefix` changes the whole cache namespace
- stored filenames and database keys are not human-readable copies of your input key
- two adapters using the same prefix still keep separate storage because they use different backends

## TTL contract

`set()` and `setMultiple()` accept:

- `null`
- integer seconds
- `DateInterval`

Behavior:

- `null` uses the adapter's configured default TTL
- `DateInterval` is converted to seconds when the call runs
- integer values are cast directly to `int`

For file and database storage, expiry is checked lazily on read or presence checks.

## Batch contract

Batch methods are stricter than the PSR interface suggests.

- `getMultiple()` requires an array of keys
- `setMultiple()` requires an array of `key => value` pairs
- `deleteMultiple()` requires an array of keys

Passing another iterable type throws `InvalidArgumentException`.

## Data contract

All built-in adapters serialize stored values.

That means:

- arrays and objects are stored as serialized payloads
- invalid serialized payloads are treated as cache misses
- when a stored payload cannot be unserialized, the adapter deletes it and returns the provided default

## Clear-scope contract

`clear()` is not prefix-scoped in any built-in adapter.

- file: removes every file in the configured cache directory
- database: bulk-deletes cache rows from the configured table
- memcached: flushes the whole Memcached server
- redis: flushes the whole selected Redis database

Use `delete()` when you need a targeted invalidation.

## Failure behavior

Common failure surfaces:

- unsupported adapter names fail in the factory
- unsupported wrapper methods fail on `Cache`
- Memcached connection checks fail during adapter construction
- Redis client failures bubble from the Redis extension
- database and filesystem errors bubble from the packages those adapters depend on
