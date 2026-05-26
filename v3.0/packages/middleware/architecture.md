# Middleware Architecture

The package builds a simple request pipeline from a matched route.

## Runtime pieces

### `MiddlewareManager`

`MiddlewareManager` is the orchestrator.

On construction it captures three route inputs:

- the route object itself
- the route middleware list
- whether the route has a rate-limit definition

Middleware execution follows the final route middleware list produced by the Router package. For grouped routes, that means group middleware runs before route-specific middleware while keeping the declaration order inside each list.

### `Middleware`

`Middleware` is only an abstract base class. It does not provide shared lifecycle hooks or helper methods. The package contract is the `apply()` method.

## Execution flow

`applyMiddlewares()` wraps the request handler in two nested stages.

### 1. Framework stage

If the route has a rate-limit definition, the manager creates `RateLimitMiddleware` with the current route and runs it first.

If the route has no rate-limit definition, this stage is skipped entirely.

### 2. Module stage

The manager then executes route middleware in order:

1. resolve the current middleware class name
2. instantiate it with the current request
3. call `apply()` and pass a closure that continues the remaining middleware

The manager resolves and creates each middleware right before it runs. Middleware later in the queue are created only when earlier middleware call `$next(...)`.

When no middleware remains, the terminal handler runs.

## Class resolution model

Module middleware classes are resolved with this pattern:

```text
<module base namespace>\<route module>\Middlewares\<middleware name>
```

The module base namespace comes from `request()->getModuleBaseNamespace()`, and the module name comes from the matched route.

That has two practical consequences:

- middleware resolution follows the active request namespace configuration
- route middleware names are simple class-name suffixes, not service ids

## Failure behavior

Resolution has two distinct outcomes when the class contract is not met:

- if the class does not exist, `MiddlewareException::middlewareNotFound(...)` is thrown
- if the class exists but does not extend `Quantum\Middleware\Middleware`, the shared base exception path throws a type error-style framework exception

## Design implications

Because the manager instantiates middleware directly instead of resolving it through DI:

- constructor dependencies are up to your middleware class design
- there is no shared middleware singleton behavior in this package
- per-request state can be passed in through the constructor and then through `apply()`

The package is intentionally narrow: route middleware execution, not general-purpose pipeline composition.
