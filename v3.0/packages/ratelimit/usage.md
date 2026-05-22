# RateLimit Usage

## Add a throttle to a route

Attach rate limiting directly to the route definition.

```php
Router::get('/api/posts', 'PostController', 'index')
    ->rateLimit(60, 60);
```

This is the normal entry point. You do not add `RateLimitMiddleware` manually.

## Choose a backend

Set the default adapter in `config/rate_limit.php`.

```php
return [
    'default' => env('RATE_LIMIT_ADAPTER', 'file'),
    // ...
];
```

Use `file` for a simple local setup.

Use `redis` when requests from different workers or servers must share the same counter.

## Resolve the limiter manually

Most applications let the middleware call the limiter for them, but you can use the same package directly.

```php
use Quantum\RateLimit\Factories\RateLimiterFactory;

$limiter = RateLimiterFactory::get();

if (!$limiter->hit('POST', '/api/uploads', get_user_ip(), 10, 60)) {
    return response()->json(['message' => 'Too Many Requests'], 429);
}
```

This is useful when you need a custom throttle outside the normal route middleware flow.

## Reset a bucket

You can clear or seed a bucket manually.

```php
$limiter->reset('POST', '/api/uploads', '127.0.0.1');
$limiter->reset('POST', '/api/uploads', '127.0.0.1', 5);
```

Use the first form to remove the current counter.

Use the second form when you want the client to start with an existing count.

## Understand the middleware response

When a request is blocked, the built-in middleware returns:

```http
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 0
Retry-After: 17
```

```json
{"message":"Too Many Requests"}
```

When a request is allowed, only `X-RateLimit-Limit` is added by this package.

## Common pitfalls

### Do not rely on client-specific limits if IP detection is unreliable

The limiter uses `get_user_ip()`.

If your proxy or server setup does not expose the real client IP, different users can share the same bucket.

### Know the difference between `interval` and adapter `ttl`

The route `interval` controls the normal request window.

The adapter config `ttl` only matters when you call `reset(..., $count)` with a positive count.

### Expect rate limiting before module middleware

If a route is throttled, the framework rate-limit middleware runs before your module middleware list.

That matters when you expected an auth middleware, logging middleware, or other custom middleware to run first.

### Handle backend failures as request failures

The package does not silently bypass storage problems.

For example, if the file adapter cannot lock its state file, the hit is treated as disallowed and the request can be rejected.
