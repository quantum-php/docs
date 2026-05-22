# Router Usage

## Define routes in a module

A module route file returns a closure that receives the route builder.

```php
return function ($route) {
    $route->get('/', 'HomeController', 'index')->name('home');

    $route->get('posts/[id=:num]', 'PostController', 'show')
        ->middlewares(['Auth'])
        ->cacheable(true, 300);
};
```

## Use fully-qualified controllers when you want explicit classes

```php
use App\Modules\Admin\Controllers\ReportController;

return function ($route) {
    $route->get('reports', ReportController::class, 'index');
};
```

## Apply shared config to a group

Apply group-wide middleware, rate limits, or caching by chaining after `group(...)`:

```php
$route->group('auth', function ($route) {
    $route->get('login', 'AuthController', 'showLogin');
    $route->post('login', 'AuthController', 'login');
})->middlewares(['Guest'])
  ->rateLimit(10, 60);
```

## Combine group-wide and route-specific middleware

```php
$route->group('account', function ($route) {
    $route->get('profile', 'AccountController', 'profile');

    $route->post('avatar', 'AccountController', 'avatar')
        ->middlewares(['VerifiedUser']);
})->middlewares(['Auth']);
```

In this pattern:

- `Auth` applies to every route in the `account` group
- `VerifiedUser` applies only to `avatar`

## Use typed and optional parameters

```php
$route->get('orders/[id=:num]', 'OrderController', 'show');
$route->get('invite/[code=:alpha:8]', 'InviteController', 'show');
$route->get('search/[term=:any]?', 'SearchController', 'index');
```

Read matched values through `route_params()` or `route_param('name')`.

## Return `Response` from handlers

```php
$route->get('health', function () {
    return response()->json(['ok' => true]);
});
```

Do not return plain strings or arrays.

## Common pitfalls

### Register specific routes before broad routes

Route matching is first-match-wins.

### Keep explicit parameter names alphabetic

`[post1=:num]` is invalid. Use `[post=:num]`.

### Prefer group chaining for shared config

Use `})->middlewares([...])` / `->rateLimit(...)` / `->cacheable(...)` for predictable group-wide behavior.
