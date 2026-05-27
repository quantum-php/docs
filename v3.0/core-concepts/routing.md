# Routing

Routing is the part of the Quantum PHP Framework that decides which code should handle an incoming request.

When a request reaches your application, Quantum matches the request method and URL against the registered routes, then dispatches the matching controller action or closure.

## Core idea

A route answers three basic questions:

- which HTTP method is allowed
- which URL pattern should match
- which handler should run

In Quantum PHP Framework, routes are not defined in one giant global file by default. They are built from module route definitions.

## Where routes live

In the framework's module structure, each module provides its own route file at:

```text
modules/<ModuleName>/routes/routes.php
```

The core module loader reads those route definitions during startup, and the route builder composes them into the application's route collection.

## How Quantum builds routes

From the upstream source, the flow is:

1. modules are loaded during web app startup
2. each enabled module contributes a route closure
3. `RouteBuilder` builds a `RouteCollection`
4. `RouteFinder` matches the current request
5. `RouteDispatcher` runs the matching controller action or closure

That means routing in Quantum is tightly connected to the module system.

## Basic route definitions

Quantum supports common route methods such as:

- `get()`
- `post()`
- `put()`
- `delete()`
- `add()` for multiple methods

A simple route can look like this:

```php
return function ($route) {
    $route->get('/', 'MainController', 'index');
};
```

This means:

- match `GET /`
- run `MainController::index()`

## Multi-method routes

If one endpoint should accept more than one HTTP method, Quantum supports that too:

```php
$route->add('signin', 'GET|POST', 'AuthController', 'signin');
```

This is useful for pages or endpoints that both display and handle a form-like flow.

## Route patterns and parameters

Quantum routes support parameterized patterns using the syntax `[name=:type]`.

### Parameter validation

Route parameter names must be letters only (`^[a-zA-Z]+$`). Using invalid characters or duplicate parameter names within a single route definition will result in a `RouteException`.

**Examples:**

```php
// Valid
$route->get('post/[id=:num]', 'PostController', 'show');

// Invalid: contains a number in the parameter name
$route->get('post/[id1=:num]', 'PostController', 'show');
```


### Pattern variations

- **Optional segments**: Append `?` to the segment (e.g., `verify/[code=:any]?`)
- **Length constraints**: Use `:type:N` to specify an exact length constraint (e.g., `[id=:num:5]` for a 5-digit number)
- **Optional length variants**: Use `:type:N?` to match a variable length up to N

### Examples

```php
// Standard parameters
$route->get('post/[uuid=:any]', 'PostController', 'post');

// Length constrained parameters
$route->get('user/[id=:num:3]', 'UserController', 'show'); // Matches 3-digit IDs

// Optional segments
$route->add('verify/[code=:alpha:10]?', 'GET|POST', 'AuthController', 'verify');
```

The router also exposes helper functions for current route information, including route parameters.


## Named routes

A route can be given a name:

```php
$route->get('posts', 'PostController', 'posts')->name('posts');
```

Named routes make it easier to refer to important endpoints by intention instead of by repeating raw paths.

> **Note**: Route name uniqueness is enforced **per module**, not globally. This allows you to safely use identical route names in different modules.

**Example: Reusing route names**

```php
// In the Api module
$route->get('data', 'ApiController', 'data')->name('list');

// In the Web module (Safe, same name, different module)
$route->get('list', 'WebController', 'list')->name('list');
```


## Route groups

Quantum supports grouping related routes:

```php
$route->group('auth', function ($route) {
    $route->get('my-posts', 'PostManagementController', 'myPosts');
    $route->get('signout', 'AuthController', 'signout');
})->middlewares(['Auth']);
```

This is useful when several routes share the same concern, such as authentication.

## Middlewares on routes

A route can have middlewares attached to it:

```php
$route->post('signup', 'AuthController', 'signup')->middlewares(['Signup']);
```

A group can also have middlewares applied to all routes inside it:

```php
$route->group('guest', function ($route) {
    // routes...
})->middlewares(['Guest']);
```

This keeps route files readable while still applying shared request rules.

## Route prefixes and modules

The core routing system stores module and prefix information as part of each route.

That matters because Quantum does not treat routes as isolated strings only. A route can carry structured metadata such as:

- module
- prefix
- group
- middlewares
- cache settings
- name

This gives the routing layer more context than a minimal URL matcher.

## Controller routes and closure routes

Quantum supports both:

- controller-action routes
- closure routes

If a route is closure-based, the dispatcher invokes the closure directly.
If a route uses a controller, the dispatcher instantiates the controller and calls the action method.

**Important**: Both closure handlers and controller actions must return an instance of `Quantum\Http\Response`. 

The dispatcher enforces this contract via `requireResponse(...)` and will throw a runtime exception if the handler returns any other type.

**Example:**

```php
// Valid
$route->get('profile', function() {
    return (new \Quantum\Http\Response())->html('...content...');
});

// Invalid (will throw an exception)
$route->get('profile', function() {
    return '...content...'; // String returned, not a Response object
});
```


## Controller lifecycle hooks

The route dispatcher also supports controller lifecycle hooks:

- `__before`
- `__after`

If those methods exist on the controller, they are called around the main action.

This is useful for setup work such as layout configuration or shared page preparation.

## CSRF-aware controller dispatch

The dispatcher checks whether a controller enables CSRF verification through a `csrfVerification` property.

If that property is enabled and the request method requires verification, Quantum checks the CSRF token before continuing.

That means route dispatch is not only about matching a URL. It also participates in request safety.

## Inspecting routes from the CLI

Quantum includes a route listing command:

```bash
php qt route:list
```

It can also filter by module.

This is helpful when you want to verify what the application has actually registered.

## Route matching precedence

The router follows a "first-hit" matching strategy. Route registration order is critical: the framework matches the incoming request (method + URI) against the registry and immediately dispatches the first route that satisfies the conditions, ignoring any subsequent overlapping routes.

> **Best Practice**: Always declare specific (static) routes before broad (dynamic) or catch-all routes to avoid unexpected dispatch behavior.

**Example: Overlapping routes**

```php
// If this route is declared first, it will always match
$route->get('posts/latest', 'PostController', 'latest');

// This broader dynamic route would never be reached if declared after
$route->get('posts/[id=:num]', 'PostController', 'show');
```

## Practical summary

- each module defines its own routes
- each route maps a method and URL pattern to a handler
- the framework collects those routes at startup
- the router finds the matching route for the request
- the dispatcher runs the controller action or closure

## Route caching and rate limiting

Quantum provides built-in support for caching router responses and applying rate limits directly from your route definitions. These methods are available on the `RouteBuilder` API and apply to the current route or a defined route group.

### Route-level configuration

You can apply caching and rate limiting to individual routes using `cacheable()` and `rateLimit()`:

```php
// Cache this response for 60 seconds
$route->get('page', 'PageController', 'show')->cacheable(true, 60);

// Limit this endpoint to 100 requests per 60 seconds
$route->get('api/posts', 'PostController', 'index')->rateLimit(100, 60);
```

### Group-level configuration

You can also apply these settings to an entire group of routes:

```php
$route->group('cached', function ($route) {
    $route->get('profile', 'UserController', 'show');
    $route->get('settings', 'UserController', 'edit');
})->cacheable(true, 120);

$route->group('api', function ($route) {
    $route->get('data', 'ApiController', 'data');
    $route->post('submit', 'ApiController', 'submit');
})->rateLimit(50, 30);
```

> **Note:** `rateLimit` values must be greater than 0; providing an invalid value will result in an exception.

## What to read next

After routing, the next best topics are:

- [Controllers](controllers.md)
- [Middleware](middleware.md)
- [Request Handling](request.md)

