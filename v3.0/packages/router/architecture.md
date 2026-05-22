# Router Architecture

## Build, match, dispatch

The Router package separates routing into three steps.

### Build

`RouteBuilder` receives one closure per module and turns those definitions into a `RouteCollection`.

Each module can also provide config options. The builder currently reads the module `prefix` option and prepends it to every route defined by that module.

### Match

`RouteFinder` walks the built collection in insertion order.

For each route it checks:

1. HTTP method is allowed
2. URI pattern matches

The first successful match becomes a `MatchedRoute` containing:

- the original `Route` object
- extracted route parameters

There is no secondary priority system. Registration order is the precedence rule.

### Dispatch

`RouteDispatcher` handles two route styles:

- closure routes
- controller-action routes

For controller routes, the dispatcher:

1. creates the controller instance directly
2. optionally runs CSRF verification when the controller exposes `public $csrfVerification = true`
3. calls `__before()` when present
4. calls the action
5. calls `__after()` when present

Arguments are resolved through `Di::autowire(...)`, so named route parameters can be injected into closures, actions, and hook methods.

## Group behavior

Groups are a builder feature, not a separate runtime route type.

A group gives related routes a shared group name and lets you apply shared configuration after the group callback finishes.

```php
$route->group('auth', function ($route) {
    $route->get('login', 'AuthController', 'showLogin');
    $route->post('login', 'AuthController', 'login');
})->middlewares(['Guest']);
```

Nested groups are rejected.

## Pattern compilation

`PatternCompiler` translates Quantum's route DSL into a regular expression and stores the extracted parameter map.

Important effects from the compiler:

- matching uses only the request path, not the query string
- incoming paths are URL-decoded before matching
- trailing slashes are accepted on literal and parameter routes
- unnamed parameters are still captured under generated names such as `_segment1`

## Metadata carried on routes

Each `Route` can carry metadata used by other packages:

- name
- module
- group
- prefix
- middlewares
- cache settings
- rate-limit settings
- compiled pattern

The router itself stores this metadata; related packages such as Middleware, ResourceCache, and RateLimit consume it later.
