# Router Helpers

Use these helpers during a request when you need matched-route metadata.

## Current route helpers

```php
$current = current_route();
$params = route_params();
$name = route_name();
$prefix = route_prefix();
```

Common helpers:

- `current_route()`
- `route_pattern()`
- `route_params()`
- `route_param(string $name)`
- `route_name()`
- `route_prefix()`
- `route_uri()`
- `route_method()`
- `current_middlewares()`
- `current_controller()`
- `current_action()`
- `route_callback()`
- `current_module()`

## Route lookup helpers

```php
$route = find_route_by_name('dashboard', 'Admin');
$exists = route_group_exists('auth', 'Admin');
```

## Module namespace helper

```php
$baseNamespace = module_base_namespace();
```

## Usage boundary

These helpers are request-scoped.

Call them from controllers, middleware, or request-time view logic.
Avoid using them during boot before a request is available.
