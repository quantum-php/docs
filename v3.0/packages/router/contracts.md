# Router Contracts

This page documents behavior you can rely on when integrating with Router.

## Route definition forms

```php
$route->get('health', function () {
    return response()->json(['ok' => true]);
});

$route->get('posts', 'PostController', 'index');
```

Contract:

- Closure route: closure handler only
- Controller route: controller + non-empty action required
- Handler return value must be `Quantum\Http\Response`

## HTTP methods

Methods are required.

`add()` accepts a pipe-delimited list (example: `GET|POST`) and normalizes values before matching.

## Naming

```php
$route->get('dashboard', 'DashboardController', 'index')->name('dashboard');
```

Contract:

- `name()` must follow a route definition
- names are unique per module
- the same name can exist in another module

## Group contracts

```php
$route->group('account', function ($route) {
    $route->get('profile', 'AccountController', 'profile');
    $route->post('avatar', 'AccountController', 'avatar')
        ->middlewares(['VerifiedUser']);
})->middlewares(['Auth']);
```

Contract:

- Nested groups are rejected
- Shared middleware/cache/rate-limit config should be chained after `group(...)`
- Route-level chaining applies only to that route

## Pattern contracts

Supported segment types:

- `:alpha`
- `:num`
- `:any`

Rules:

- explicit parameter names are alphabetic
- duplicate parameter names in one route are rejected
- optional segments resolve to `null` when absent

## Dispatch contracts

For controller routes:

- target action method must exist
- controller action must return `Response`
- if `__before()` / `__after()` exist, they run around the action

## Failure modes you should handle

- invalid method declarations
- incomplete controller/action definitions
- duplicate route names in one module
- nested groups
- invalid route parameter names
- non-`Response` handler return values
