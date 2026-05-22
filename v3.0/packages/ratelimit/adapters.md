# RateLimit Adapters

RateLimit stores counters through one adapter per configured backend.

Use the file adapter when you want a local default with no extra service. Use the Redis adapter when rate limits must be shared across multiple PHP processes or servers.

## Configure the default adapter

`RateLimiterFactory` reads `config/rate_limit.php` and uses `rate_limit.default` when you do not request an adapter explicitly.

A typical config looks like this:

```php
return [
    'default' => env('RATE_LIMIT_ADAPTER', 'file'),

    'file' => [
        'path' => base_dir() . DS . 'cache' . DS . 'data',
        'ttl' => 60,
        'prefix' => 'api-rate-limit:',
    ],

    'redis' => [
        'host' => env('REDIS_HOST', '127.0.0.1'),
        'port' => env('REDIS_PORT', 6379),
        'ttl' => 60,
        'prefix' => 'api-rate-limit:',
    ],
];
```

## File adapter

`FileRateLimitAdapter` stores one JSON state file per rate-limit key and uses a lock file to serialize updates.

Use it when the app runs on one machine or when each node can keep its own independent limits.

### Required config

- `path` - directory used for `.rate` and `.lock` files
- `ttl` - lifetime used only when you manually reset to a non-zero count
- `prefix` - optional namespace added before hashing the key

### What it guarantees

- The storage directory is created if it does not exist.
- Each hit stores `count` and `reset_at`.
- When the window expires, the next hit starts a fresh counter.
- `retryAfter()` returns `0` when the state file is missing or unreadable.

### Caveats

- File limits are local to the filesystem backing `path`.
- If the adapter cannot open or lock its state file, `hit()` returns `false`, which causes the middleware to reject the request.
- Stored filenames are hashed, so inspecting the directory is useful for operations, not for human-readable debugging.

## Redis adapter

`RedisRateLimitAdapter` stores each counter as one Redis key.

Use it when multiple workers or servers must share the same limits.

### Required config

- `host`
- `port`
- `ttl` - lifetime used only when you manually reset to a non-zero count
- `prefix` - optional string prepended directly to the runtime key

### What it guarantees

- The first hit creates the key and sets its expiry to the route interval.
- Later hits increment the same key until the key expires.
- `retryAfter()` returns the Redis TTL in seconds, or `0` when Redis reports no usable expiry.

### Caveats

- The adapter only configures host and port. Authentication, database selection, and other Redis options are not part of this package contract.
- `prefix` is stored directly in Redis key names, unlike the file adapter where it only affects the hashed filename.

## Shared adapter behavior

Both built-in adapters support the same runtime contract:

- `hit($key, $limit, $interval)` increments and reports whether the request is still allowed
- `reset($key)` clears the counter
- `reset($key, $count)` seeds the counter and uses the adapter config `ttl`, not the route interval
- `retryAfter($key)` returns seconds until reset, or `0`

## Unsupported adapters

The factory only ships `file` and `redis`.

Passing any other adapter name to `RateLimiterFactory::get(...)` throws `RateLimitException::adapterNotSupported(...)`.
