# Router

The Router package turns module route definitions into runtime route objects, matches the incoming request, and dispatches the selected handler.

Use it when you are defining application routes, attaching route metadata such as middleware or rate limits, or reading information about the currently matched route.

## What the package provides

The package is built around four responsibilities:

- `RouteBuilder` collects module route closures into a `RouteCollection`
- `RouteFinder` matches the current request against that collection
- `RouteDispatcher` runs the matched closure or controller action
- helper functions expose the matched route's metadata during a request

## Basic route definition

```php
return function ($route) {
    $route->get('/', 'HomeController', 'index')->name('home');

    $route->add('signin', 'GET|POST', 'AuthController', 'signin')
        ->middlewares(['Guest'])
        ->rateLimit(10, 60);
};
```

Inside module route files, short controller names are resolved to the current module's `Controllers` namespace automatically.

## Pattern support

Route patterns can include typed parameters:

```php
$route->get('posts/[id=:num]', 'PostController', 'show');
$route->get('invite/[code=:alpha:8]', 'InviteController', 'show');
$route->get('verify/[token=:any]?', 'AuthController', 'verify');
```

Supported parameter types are:

- `:alpha` letters only
- `:num` digits only
- `:any` any characters except `/`

You can also:

- name a parameter with `[name=:type]`
- require an exact length with `[name=:type:5]`
- make a segment optional with `?`
- combine both so `[name=:type:5]?` matches up to that length or no segment at all

## Request lifecycle

At runtime, the package follows this flow:

1. `RouteBuilder` builds routes from module closures
2. `RouteFinder` returns the first route whose method and URI both match
3. `RouteDispatcher` runs the handler and requires a `Quantum\Http\Response`

Route order matters. The finder stops at the first matching route.

## Key caveats

- Route names must be unique within a module, but can repeat across different modules.
- Nested route groups are not supported.
- Closure handlers and controller actions must return `Quantum\Http\Response`.
- Short controller names only work when the builder has module context, which is the normal module-routes flow.

## Read next

- [Architecture](architecture.md)
- [Contracts](contracts.md)
- [Helpers](helpers.md)
- [Usage](usage.md)
