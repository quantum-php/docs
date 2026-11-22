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

Supported public methods are the PSR-16 methods implemented by the adapters, with the types of `psr/simple-cache` 3:

- `get(string $key, mixed $default = null): mixed`
- `getMultiple(iterable $keys, mixed $default = null): iterable`
- `has(string $key): bool`
- `set(string $key, mixed $value, null|int|DateInterval $ttl = null): bool`
- `setMultiple(iterable $values, null|int|DateInterval $ttl = null): bool`
- `delete(string $key): bool`
- `deleteMultiple(iterable $keys): bool`
- `clear(): bool`

Calling a method the adapter does not implement throws `CacheException::methodNotSupported(...)`.

## Key contract

A key is a string. Pass a number as text, `cache()->get('42')`: `cache()->get(42)` throws a `TypeError`, because the methods that take one key declare `string $key`.

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

A TTL of `0` or less, or a `DateInterval` in the past, means the item is already expired, as PSR-16 defines: `get()` returns the default and `has()` returns `false` right after `set()`. Redis and Memcached delete the item at once; file and database storage keep it with an expiry in the past and delete it on the next read or presence check.

## Batch contract

`getMultiple()`, `setMultiple()` and `deleteMultiple()` accept any iterable: an array, a generator or an iterator. A value that is not iterable throws a `TypeError`.

```php
cache()->setMultiple(['user.1' => $first, 'user.2' => $second], 300);

$users = cache()->getMultiple(['user.1', 'user.2']);
```

PHP turns a numeric string array key into an integer, so in `setMultiple(['42' => $value])` the key arrives as `42`. The batch methods turn integer keys back into strings, so numeric keys work as expected. The array `getMultiple()` returns follows the same PHP rule, so a numeric key comes back as an integer key: `getMultiple(['42'])` returns `[42 => …]`. Any other key that is not a string, such as `true`, `null` or an object, throws `Quantum\Cache\Exceptions\InvalidCacheKeyException`, which implements `Psr\SimpleCache\InvalidArgumentException`. The message names the type, for example `The cache key must be a string, bool given`.

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
