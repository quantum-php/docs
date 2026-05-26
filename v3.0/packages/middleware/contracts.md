# Middleware Contracts

## Base middleware contract

Every middleware class extends `Quantum\Middleware\Middleware` and implements:

```php
public function apply(Request $request, Closure $next): Response;
```

## Parameter expectations

### `Request $request`

This is the current request object being processed.

The manager passes the same request object through the pipeline, so upstream middleware can mutate it before later middleware or the terminal handler runs.

### `Closure $next`

Call `$next($request)` to continue the pipeline.

If you do not call `$next(...)`, the request stops at the current middleware and your middleware becomes responsible for returning the final `Response`.

### `Response`

`apply()` must return a `Response`.

That response can come from:

- a redirect or error path created by the middleware itself
- the downstream pipeline via `$next($request)`

## Construction contract

Although the abstract base class does not define a constructor, `MiddlewareManager` creates middleware instances like this:

```php
new $middlewareClass($request)
```

In practice, if your middleware defines a constructor, it accepts the current request object as passed by the manager.

## Naming and placement contract

The manager expects route middleware names to map to classes under the module `Middlewares` namespace.

For a route middleware name like `Auth`, the package looks for a class shaped like:

```text
<module base namespace>\<module>\Middlewares\Auth
```

## Order contract

Middleware runs in the order stored on the matched route.

For routes built through Router groups, shared group middleware runs before route-specific middleware. Within each list, declaration order is preserved.

## Error contract

The package guarantees one dedicated middleware-specific exception path:

- missing middleware class -> `MiddlewareException::middlewareNotFound(...)`

The package also enforces the base-class requirement after instantiation, so a class that does not extend `Quantum\Middleware\Middleware` is rejected before `apply()` runs.
