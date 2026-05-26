# Middleware

The Middleware package runs route middleware around the final request handler.

Use it when you want route-level request gates such as authentication, ownership checks, validation, or redirects before the controller action runs.

This package is intentionally small. It provides:

- `Quantum\Middleware\Middleware`, the base contract every middleware class extends
- `Quantum\Middleware\MiddlewareManager`, the runtime pipeline that resolves and executes middleware classes for a matched route
- `Quantum\Middleware\Exceptions\MiddlewareException` for missing middleware classes and invalid middleware type handling

## When this package runs

`MiddlewareManager` is created from a matched route and then applies middleware in two stages:

1. framework middleware
2. module middleware

In the current implementation, the framework stage adds rate limiting when the route has a rate-limit definition. After that, the manager runs the route's module middleware list in order and finally calls the terminal handler.

When a route combines group middleware and route-specific middleware, the group entries wrap the route entries. That keeps shared gates such as `Auth` at the outside of the pipeline and leaves route-specific checks for the inner stage.

## What middleware classes look like

Every middleware extends `Quantum\Middleware\Middleware` and implements:

```php
use Closure;
use Quantum\Http\Request;
use Quantum\Http\Response;
use Quantum\Middleware\Middleware;

final class Auth extends Middleware
{
    public function apply(Request $request, Closure $next): Response
    {
        if (!auth()->check()) {
            return redirect('/signin');
        }

        return $next($request);
    }
}
```

A middleware can:

- return its own response and stop the pipeline
- call `$next($request)` and let the request continue

## Important constraints

- Middleware names are resolved to module classes only. There is no alias registry or container-based middleware resolution in this package.
- The manager instantiates each middleware directly with `new $middlewareClass($request)`.
- The resolved class extends `Quantum\Middleware\Middleware`.
- Missing classes raise `MiddlewareException`; wrong base types raise the shared base exception for invalid inheritance.
- Rate limiting, when present on the route, always runs before module middleware.

## Read next

- [Architecture](architecture.md)
- [Contracts](contracts.md)
- [Usage](usage.md)
