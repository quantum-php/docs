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

Short controller names are resolved inside the current module's `Controllers` namespace.
Use a fully-qualified class when you want a route file to point at a controller outside that default module path.

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

Return a `Response` instance from closure handlers and controller actions.

## Use action parameters for request-time dependencies

Router creates controller instances directly for each dispatch, then resolves action arguments through the DI container.
That keeps controllers lightweight and lets you receive matched params or services in the action itself.

```php
use Quantum\Http\Request;
use Quantum\Http\Response;

class ProfileController
{
    protected bool $csrfVerification = true;

    public function update(Request $request, string $id): Response
    {
        return response()->json([
            'updated' => true,
            'id' => $id,
        ]);
    }
}
```

## Common pitfalls

### Register specific routes before broad routes

Route matching is first-match-wins.

### Keep explicit parameter names alphabetic

`[post1=:num]` is invalid. Use `[post=:num]`.

### Prefer group chaining for shared config

Use `})->middlewares([...])` / `->rateLimit(...)` / `->cacheable(...)` for predictable group-wide behavior.
