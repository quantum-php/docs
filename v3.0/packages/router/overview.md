# Router

Router defines how requests map to handlers in Quantum modules.

Use it when you need to:

- define routes and route groups
- attach middleware, cache, or rate-limit metadata
- read matched-route data during request handling

## Quick example

```php
return function ($route) {
    $route->get('/', 'HomeController', 'index')->name('home');

    $route->add('signin', 'GET|POST', 'AuthController', 'signin')
        ->middlewares(['Guest'])
        ->rateLimit(10, 60);
};
```

## Pattern support

```php
$route->get('posts/[id=:num]', 'PostController', 'show');
$route->get('invite/[code=:alpha:8]', 'InviteController', 'show');
$route->get('verify/[token=:any]?', 'AuthController', 'verify');
```

Supported parameter types:

- `:alpha` letters only
- `:num` digits only
- `:any` any characters except `/`

## What matters operationally

- Route matching is first-match-wins.
- Group-wide config is best applied by chaining after `group(...)`.
- Route handlers return `Quantum\Http\Response`.
- Short controller names resolve inside the current module; fully-qualified class names opt into an explicit target.
- Controllers are instantiated directly, so action parameters are the right place for DI-backed request values.
- Route names stay unique inside a module.

## Read next

- [Usage](usage.md)
- [Contracts](contracts.md)
- [Helpers](helpers.md)
- [Architecture](architecture.md)
