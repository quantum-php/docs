# RateLimit Usage

## Add a throttle to a route

Attach rate limiting directly to the route definition.

```php
Router::get('/api/posts', 'PostController', 'index')
    ->rateLimit(60, 60);
```

This is the standard entry point. The framework wires `RateLimitMiddleware` for matched routes, so there is no extra middleware registration step here.

## Apply one throttle to a route group

When several routes should share the same rate-limit settings, attach `rateLimit(...)` to the group.

```php
Router::group('/api', function () {
    Router::get('/posts', 'PostController', 'index');
    Router::post('/posts', 'PostController', 'store');
})->rateLimit(120, 60);
```

This copies the same `limit` and `interval` settings to each route created by that group.

## Choose a backend

Set the default adapter in `config/rate_limit.php`.

```php
return [
    'default' => env('RATE_LIMIT_ADAPTER', 'file'),
    // ...
];
```

Use `file` for a simple local setup.

Use `redis` when requests from different workers or servers should share the same counter.

## Resolve the limiter manually

Most applications let the middleware call the limiter for them, and you can use the same package directly when you want a custom throttle outside the route flow.

```php
use Quantum\RateLimit\Factories\RateLimiterFactory;

$limiter = RateLimiterFactory::get();

if (!$limiter->hit('POST', '/api/uploads', get_user_ip(), 10, 60)) {
    return response()->json(['message' => 'Too Many Requests'], 429);
}
```

## Reset a bucket

You can clear or seed a bucket manually.

```php
$limiter->reset('POST', '/api/uploads', '127.0.0.1');
$limiter->reset('POST', '/api/uploads', '127.0.0.1', 5);
```

Use the first form to remove the current counter.

Use the second form when you want the client to start with an existing count.

## Understand the middleware response

When a request is throttled, the built-in middleware returns:

```http
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 0
Retry-After: 17
```

```json
{"message":"Too Many Requests"}
```

When a request is allowed, this package adds `X-RateLimit-Limit` to the response.

## Common integration notes

### Keep client IP resolution accurate

The limiter uses `get_user_ip()`.

With reverse proxies or load balancers, configure IP forwarding so `get_user_ip()` resolves the real client IP. That keeps each bucket aligned with the right client.

### Know the difference between `interval` and adapter `ttl`

The route `interval` controls the normal request window.

The adapter config `ttl` matters when you call `reset(..., $count)` with a positive count.

### Plan middleware order around throttling

For throttled routes, the framework rate-limit middleware runs before your module middleware list.

That matters when you expect auth, logging, or other custom middleware to run first.

### Handle backend-specific storage outcomes

Storage adapters expose runtime issues differently.

For the file adapter, an unavailable lock or state handle produces a blocked hit result.

For Redis, connection and runtime issues surface through the Redis client, so app-level exception handling is the right place to capture them.
