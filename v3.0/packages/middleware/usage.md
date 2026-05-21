# Middleware Usage

## Write a middleware class

Create a class in your module's `Middlewares` namespace and extend `Quantum\Middleware\Middleware`.

```php
namespace App\Blog\Middlewares;

use Closure;
use Quantum\Http\Request;
use Quantum\Http\Response;
use Quantum\Middleware\Middleware;

final class RequireEditor extends Middleware
{
    public function __construct(private Request $request)
    {
    }

    public function apply(Request $request, Closure $next): Response
    {
        if (!auth()->check() || !auth()->user()->isEditor()) {
            return redirect('/signin');
        }

        return $next($request);
    }
}
```

The constructor example matters because the manager instantiates middleware with the current request before `apply()` runs.

## Continue or stop

The basic decision inside `apply()` is simple:

- return `$next($request)` when the request may continue
- return your own `Response` when the request should stop here

A common pattern is to validate first and only continue on success.

```php
public function apply(Request $request, Closure $next): Response
{
    if (!$request->has('token')) {
        return response()->json([
            'message' => 'Missing token',
        ], 400);
    }

    return $next($request);
}
```

## Understand execution order

Middleware runs in route order.

If a route lists multiple middleware names, the first one gets the first chance to stop or modify the request. Later middleware only run when earlier middleware call `$next(...)`.

## Know what the package resolves

The manager does not look in the container and does not resolve middleware by alias.

Make sure:

- the class exists under the current module's `Middlewares` namespace
- the route middleware name matches the class suffix exactly
- the class extends `Quantum\Middleware\Middleware`

## Keep rate limiting in mind

If the route also has a rate-limit definition, Quantum runs rate limiting before your module middleware.

That means your custom middleware may never run when the request is already rejected by the rate-limit stage.

## Good fit for this package

Use middleware for request-level gates such as:

- authentication and guest checks
- ownership and role checks
- request preconditions
- early redirects or early API error responses

Avoid putting long business workflows here. The package is built for request flow control around a route handler.
