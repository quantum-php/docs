# Router Contracts

## Module route file contract

`RouteBuilder::build()` expects one closure per module.

If a module route entry is not a `Closure`, the builder throws a route exception for that module.

## Handler contract

A route must be defined in one of these forms:

```php
$route->get('health', function () {
    return response()->json(['ok' => true]);
});

$route->get('posts', 'PostController', 'index');
```

Rules that matter:

- a closure route cannot also define controller or action values
- a controller route must define both controller and non-empty action
- controller actions and closures must return `Quantum\Http\Response`

Returning a string, array, or any other value fails at dispatch time.

## HTTP methods contract

Route methods are required.

`add()` splits a pipe-delimited string such as `GET|POST`, trims each token, uppercases the final values, and rejects an empty method list.

Method matching is case-insensitive in practice because stored methods are normalized to uppercase before comparison.

## Naming contract

```php
$route->get('dashboard', 'DashboardController', 'index')->name('dashboard');
```

Rules:

- `name()` must be called after a route definition
- route names must be unique within the current module
- the same name can exist in another module

## Group and chaining contract

### `group(string $name, callable $callback)`

- creates a shared group name for routes defined inside the callback
- rejects nested groups
- returns the builder so you can chain shared configuration after the group

### `middlewares(array $middlewares)`

This method has three valid contexts:

- after a single route definition: applies only to that route
- inside a group before routes are defined: queues middleware for all routes in the group
- after `group(...)`: applies to the routes created by that last group

### `cacheable(bool $enabled, ?int $ttl = null)` and `rateLimit(int $limit, int $interval)`

These methods also work on a single route or a whole group, but their in-group behavior is different from `middlewares()`:

- inside a group they update the routes already created in that group
- after `group(...)` they update all routes from that last group
- outside a route or group they throw a route exception

That means calling `cacheable()` or `rateLimit()` midway through a group only affects routes defined earlier in that group, not routes declared later.

## Pattern contract

Supported segment types:

- `:alpha`
- `:num`
- `:any`

Parameter-name rules:

- explicit names may contain letters only
- duplicate parameter names in one route are rejected
- unnamed parameters are auto-named `_segment<index>`

Examples:

```php
$route->get('posts/[id=:num]', 'PostController', 'show');
$route->get('invite/[code=:alpha:8]', 'InviteController', 'show');
$route->get('search/[term=:any]?', 'SearchController', 'index');
```

Matching behavior that affects usage:

- the query string is ignored
- trailing slashes are accepted
- optional parameters resolve to `null` when the segment is absent

## Controller dispatch contract

For controller routes, the dispatcher creates the controller with `new $controllerClass()`.

Practical effects:

- the package does not resolve controllers from the DI container
- controller constructors must work with direct instantiation
- the target action method must exist before dispatch

If the controller defines `__before()` or `__after()`, those methods run around the action and receive autowired arguments the same way the action does.

## Failure behavior

Common route-package failures include:

- missing or invalid HTTP methods
- incomplete controller definitions
- route names reused inside the same module
- nested groups
- invalid or duplicate parameter names
- missing controller action methods
- handler return values that are not `Response`
