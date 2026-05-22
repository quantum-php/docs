# Router Architecture

Router runs in three stages: build, match, dispatch.

## 1) Build

`RouteBuilder` collects module route closures and produces a route collection.

At this stage, module-level prefix configuration is applied to routes.

## 2) Match

`RouteFinder` scans routes in registration order.

Matching rules that affect usage:

- first matching route wins
- method and URI must both match
- query string is ignored for route matching

## 3) Dispatch

`RouteDispatcher` executes either:

- a closure handler, or
- a controller action

If `__before()` / `__after()` hooks exist on the controller, they run around the action.

## Group model

Groups are a route-definition convenience. They are not a separate runtime route type.

Use groups to:

- organize related routes
- apply shared metadata by chaining after `group(...)`

```php
$route->group('auth', function ($route) {
    $route->get('login', 'AuthController', 'showLogin');
    $route->post('login', 'AuthController', 'login');
})->middlewares(['Guest']);
```

## Route metadata

Route objects can carry metadata consumed by other packages:

- name
- module
- group
- prefix
- middlewares
- cache settings
- rate-limit settings
