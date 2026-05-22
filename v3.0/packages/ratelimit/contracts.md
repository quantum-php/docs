# RateLimit Contracts

## Route contract

Rate limiting starts at the route definition.

```php
$route->rateLimit(100, 60);
```

### Parameters

- `$limit` - maximum allowed hits in the current window
- `$interval` - window length in seconds

Both values must be greater than `0`. Invalid values fail immediately when the route is configured.

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
- returns `false` after the limit is exceeded

#### `retryAfter(...)`

- returns remaining seconds in the current window when the adapter can determine it
- returns `0` when no state exists or expiry cannot be determined

#### `reset(...)`

- with no count or a non-positive count, clears the bucket
- with a positive count, seeds the bucket with that count and starts a new adapter-level TTL window

## Factory contract

`RateLimiterFactory::get(?string $adapter = null)` resolves one `RateLimiter` per adapter name and reuses that instance for later calls.

That means repeated calls for the same adapter share the same underlying adapter object for the life of the current DI-managed factory instance.

If `config('rate_limit')` has not been imported yet, the factory imports `config/rate_limit.php` lazily on first use.

## Middleware contract

`RateLimitMiddleware` reads the matched route's rate-limit settings and either:

- passes the request through with `X-RateLimit-Limit`, or
- returns a `429` JSON response immediately

If the adapter reports `retryAfter()` as `0`, the middleware falls back to the route interval for the `Retry-After` header.
