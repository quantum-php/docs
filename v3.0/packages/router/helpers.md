# Router Helpers

The package exposes helper functions for reading the currently matched route from request handling code.

Use them inside controllers, views, middleware, or other request-scoped code when you need route metadata without passing the full `Request` object around.

## Current route metadata

```php
$current = current_route();
$params = route_params();
$name = route_name();
$prefix = route_prefix();
```

Available helpers include:

- `current_route()` - original route pattern string
- `route_pattern()` - compiled pattern string stored on the matched route
- `route_params()` - all extracted route parameters
- `route_param(string $name)` - one extracted parameter
- `route_name()` - current route name
- `route_prefix()` - current route prefix
- `route_uri()` - current request URI
- `route_method()` - current request method
- `route_cache_settings()` - current route cache metadata
- `current_middlewares()` - current route middlewares
- `current_controller()` - current controller class name
- `current_action()` - current controller action name
- `route_callback()` - current closure handler when the route is closure-based
- `current_module()` - current route module name

## Route lookup helpers

```php
$route = find_route_by_name('dashboard', 'Admin');
$exists = route_group_exists('auth', 'Admin');
```

These helpers are useful when you need route metadata for a named route or want to check whether a group exists in a module.

## Module namespace helper

```php
$baseNamespace = module_base_namespace();
```

This returns the module base namespace that the route builder uses when it expands short controller names.

## Important caveat

These helpers depend on the active request object.

`current_module()` safely returns `null` when no `Request` has been registered in DI yet. The other helpers call `request()` directly, so they should be treated as request-only helpers rather than generic boot-time utilities.
