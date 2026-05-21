# Middleware Architecture

The package builds a simple request pipeline from a matched route.

## Runtime pieces

### `MiddlewareManager`

`MiddlewareManager` is the orchestrator.

On construction it pulls three things from the matched route:

- the route object itself
- the route middleware list
- whether the route has a rate-limit definition

It stores the route middleware names as a numeric queue with `array_values(...)`, so execution order follows the route's declared order.

### `Middleware`

`Middleware` is only an abstract base class. It does not provide shared lifecycle hooks or helper methods. The package contract is the `apply()` method.

## Execution flow

`applyMiddlewares()` wraps the request handler in two nested stages.

### 1. Framework stage

If the route has a rate-limit definition, the manager creates `RateLimitMiddleware` with the current route and runs it first.

If the route has no rate-limit definition, this stage is skipped entirely.

### 2. Module stage

The manager then walks the route middleware queue recursively:

1. read the current middleware name
2. resolve the concrete class name
3. instantiate the middleware with the current request
4. advance the queue pointer
5. call `apply()` and pass a closure that continues the remaining queue

When the queue is empty, the manager calls the terminal handler.

## Class resolution model

Module middleware classes are resolved with this pattern:

```text
<module base namespace>\<route module>\Middlewares\<middleware name>
```

The module base namespace comes from `request()->getModuleBaseNamespace()`, and the module name comes from the matched route.

That has two practical consequences:

- middleware resolution is tied to the active request namespace configuration
- route middleware names are simple class-name suffixes, not service ids

## Failure behavior

Resolution fails in two distinct ways:

- if the class does not exist, `MiddlewareException::middlewareNotFound(...)` is thrown
- if the class exists but does not extend `Quantum\Middleware\Middleware`, the shared base exception path throws a type error-style framework exception

## Design implications

Because the manager instantiates middleware directly instead of resolving it through DI:

- constructor dependencies are up to your middleware class design
- there is no shared middleware singleton behavior in this package
- per-request state can be passed in through the constructor and then through `apply()`

The package is intentionally narrow: route middleware execution, not general-purpose pipeline composition.
