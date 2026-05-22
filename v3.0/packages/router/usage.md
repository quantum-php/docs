# Router Usage

## Define routes in a module

A module route file should return a closure that receives the builder.

```php
return function ($route) {
    $route->get('/', 'HomeController', 'index')->name('home');

    $route->get('posts/[id=:num]', 'PostController', 'show')
        ->middlewares(['Auth'])
        ->cacheable(true, 300);
};
```

Short controller names work well here because the builder already knows the current module.

## Use a fully qualified controller when needed

```php
use App\Modules\Admin\Controllers\ReportController;

return function ($route) {
    $route->get('reports', ReportController::class, 'index');
};
```

Use this form when you want explicit controller class names or when you are building routes outside the normal module namespace convention.

## Share configuration across a group

```php
$route->group('auth', function ($route) {
    $route->get('login', 'AuthController', 'showLogin');
    $route->post('login', 'AuthController', 'login');
})->middlewares(['Guest'])
  ->rateLimit(10, 60);
```

This is the clearest way to apply shared middleware, caching, or rate limits to every route in the group.

## Mix route-specific and group-wide middleware

```php
$route->group('account', function ($route) {
    $route->middlewares(['Auth']);

    $route->get('profile', 'AccountController', 'profile');

    $route->post('avatar', 'AccountController', 'avatar')
        ->middlewares(['VerifiedUser']);
});
```

In this pattern:

- `Auth` is queued for every route in the group
- `VerifiedUser` applies only to the `avatar` route

## Use typed and optional parameters

```php
$route->get('orders/[id=:num]', 'OrderController', 'show');
$route->get('invite/[code=:alpha:8]', 'InviteController', 'show');
$route->get('search/[term=:any]?', 'SearchController', 'index');
```

Parameter values are extracted from the path and can be read later through `route_params()` or injected into handlers through the dispatcher's DI autowiring.

## Return a Response from every handler

```php
$route->get('health', function () {
    return response()->json(['ok' => true]);
});
```

Do not return plain arrays or strings from route handlers. The dispatcher rejects anything that is not `Quantum\Http\Response`.

## Read matched-route data during a request

```php
if (route_name() === 'home') {
    // ...
}

$id = route_param('id');
```

This is useful for view logic, middleware decisions, and shared controller helpers.

## Common pitfalls

### Register specific routes before broad ones

The finder returns the first match.

If a dynamic route is registered before a more specific literal route, the literal route may never run.

### Keep parameter names alphabetic

`[post1=:num]` is invalid because explicit parameter names can contain letters only.

Use `[post=:num]` or leave the segment unnamed if you do not care about the key name.

### Prefer chaining shared group config after `group(...)`

That pattern is the least surprising.

Calling `cacheable()` or `rateLimit()` from inside a group only updates routes that already exist at that moment.
