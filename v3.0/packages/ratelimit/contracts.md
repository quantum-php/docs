# RateLimit Contracts

## Route contract

Rate limiting starts at the route definition or route group definition.

```php
Router::group('/api', function () {
    Router::get('/posts', 'PostController', 'index');
    Router::get('/comments', 'CommentController', 'index');
})->rateLimit(100, 60);
```

### Parameters

- `$limit` - maximum allowed hits in the current window
- `$interval` - window length in seconds

Both values need to be greater than `0`. The route API validates them as soon as you call `rateLimit(...)`.

### Where `rateLimit(...)` applies

`RouteBuilder::rateLimit(...)` supports three usage patterns:

- directly on a route definition
- on the current group while the group is being built
- immediately after a group definition, which applies the settings to the routes that group just created

Calling `rateLimit(...)` without an active route or group raises `RouteException::rateLimitOutsideRoute()`.

## Runtime key contract

`RateLimiter` groups requests by a normalized key shaped like:

```text
<METHOD>:<route-pattern>:<ip>
```

Normalization rules that affect real usage:

- HTTP methods are uppercased
- empty route patterns become `/`
- missing or empty IPs become `0.0.0.0`

Because the route pattern is part of the key, counts follow the declared route pattern rather than the final controller name.

## Limiter contract

`RateLimiter` is a thin wrapper around one adapter instance.

```php
$limiter = RateLimiterFactory::get();

$allowed = $limiter->hit('GET', '/api/posts', '127.0.0.1', 60, 60);
$retryAfter = $limiter->retryAfter('GET', '/api/posts', '127.0.0.1');
$limiter->reset('GET', '/api/posts', '127.0.0.1');
```

### Method behavior

#### `hit(...)`

- increments the current counter
- returns `true` while the counter is within the limit
- returns `false` once the bucket moves past the limit

#### `retryAfter(...)`

- returns remaining seconds in the current window when the adapter can determine it
- returns `0` when no state exists or expiry is not available

#### `reset(...)`

- with no count or a non-positive count, clears the bucket
- with a positive count, seeds the bucket with that count and starts a new adapter-level TTL window

## Factory contract

`RateLimiterFactory::get(?string $adapter = null)` resolves one `RateLimiter` per adapter name and reuses that instance for later calls.

That means repeated calls for the same adapter share the same underlying adapter object for the life of the current DI-managed factory instance.

If `config('rate_limit')` is not loaded yet, the factory imports `config/rate_limit.php` on first use.

## Middleware contract

`RateLimitMiddleware` reads the matched route's rate-limit settings and then:

- passes the request through with `X-RateLimit-Limit`, or
- returns a `429` JSON response immediately

When the adapter returns `0` from `retryAfter()`, the middleware uses the route interval for the `Retry-After` header.
