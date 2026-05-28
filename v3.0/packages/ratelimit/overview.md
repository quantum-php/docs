# RateLimit

The RateLimit package protects individual routes from repeated requests from the same client.

Use it when you want a route-level throttle such as "60 requests per minute" without building your own counters.

## What the package provides

The package combines three pieces:

- `Route::rateLimit($limit, $interval)` to declare a throttle on a route
- `RateLimitMiddleware` to enforce that throttle during the framework middleware stage
- `RateLimiterFactory` and `RateLimiter` to resolve the configured storage adapter

The built-in adapters are:

- `file`
- `redis`

## Basic example

```php
Router::get('/api/posts', 'PostController', 'index')
    ->rateLimit(60, 60);
```

This means the matched route allows up to 60 hits per 60-second window for the same request method, route pattern, and client IP.

## How requests are grouped

The limiter builds one key from:

- the HTTP method
- the route pattern
- the client IP from `get_user_ip()`

That means these are counted separately:

- `GET /api/posts`
- `POST /api/posts`
- the same route from different client IPs

If the IP cannot be resolved, the limiter falls back to `0.0.0.0`, so multiple requests can end up sharing the same bucket.

## Response behavior

When a request is allowed, the response gets:

- `X-RateLimit-Limit`

When a request is blocked, the middleware returns a JSON `429 Too Many Requests` response with:

- `X-RateLimit-Limit`
- `X-RateLimit-Remaining: 0`
- `Retry-After`

Blocked responses use this payload:

```json
{"message":"Too Many Requests"}
```

## Important constraints

- Rate limiting only runs on routes that explicitly call `rateLimit(...)`.
- The middleware runs before module middleware.
- The package does not send `X-RateLimit-Remaining` on successful requests.
- Unsupported adapter names fail with `RateLimitException::adapterNotSupported(...)`.
- Adapter configuration is loaded from `config/rate_limit.php` the first time the factory is used.
- Storage backends report errors differently: file storage returns a blocked hit when lock/state access fails, while Redis client issues may surface as runtime exceptions.

