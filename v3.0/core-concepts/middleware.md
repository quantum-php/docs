# Middleware

Middleware is the part of the Quantum PHP Framework that runs between route matching and the final controller action.

It gives you a way to inspect, block, validate, or redirect a request before the main handler continues.

## Core idea

A simple way to think about middleware is:

- the router finds the matching route
- Quantum checks the route's middleware list
- each middleware gets a chance to run
- if all middlewares allow the request, the controller action continues
- if one middleware stops the request, the action does not run

So middleware acts like a request gatekeeper.

## Why middleware belongs in core concepts

In Quantum, middleware is not a side feature.

It is wired directly into the request flow:

- routes attach middleware names
- matched routes carry those middleware definitions
- `MiddlewareManager` loads middleware classes from the current module
- each middleware runs through the `apply()` contract

That makes middleware part of the core request lifecycle.

## How middleware is attached

Middleware is usually attached in route files.

A single route can define middleware like this:

```php
$route->post('signup', 'AuthController', 'signup')->middlewares(['Signup']);
```

A route group can also share middleware:

```php
$route->group('auth', function ($route) {
    $route->get('my-posts', 'PostManagementController', 'myPosts');
    $route->get('signout', 'AuthController', 'signout');
})->middlewares(['Auth']);
```

This is one reason middleware feels central in Quantum. You see it directly inside the routing layer.

## The middleware contract

At the framework level, middleware classes extend `Quantum\Middleware\Middleware` and implement:

```php
apply(Request $request, Closure $next): Response
```

That means every middleware receives:

- the current request
- a `$next` callback for continuing the pipeline

**Note**: Middleware instances are constructed as `new $middlewareClass($request)` by the `MiddlewareManager` before the `apply()` method is executed.

If the middleware calls `$next($request)`, processing continues. If it does not, the request stops there.

## How Quantum resolves middleware classes

From the upstream `MiddlewareManager`, Quantum resolves middleware classes by module.

In practice, it expects names like:

```text
<ModuleNamespace>\<ModuleName>\Middlewares\<MiddlewareName>
```

That means route middleware names such as `Auth` or `Guest` are usually resolved to classes inside the current module's `Middlewares` directory.

## Where middleware lives

From the module templates, middleware classes typically live under:

```text
modules/<ModuleName>/src/Middlewares/
```

Examples from the upstream templates include:

- `Auth`
- `Guest`
- `Editor`
- `Signup`
- `Reset`
- `Verify`
- `PostOwner`
- `BasicAuth`

## Common middleware jobs

The upstream templates show several common middleware responsibilities.

### Authentication
Example:

- `Auth`

This checks whether the user is authenticated before allowing access.

### Guest-only access
Example:

- `Guest`

This prevents authenticated users from visiting routes meant only for guests, such as sign-in pages.

### Authorization and ownership
Examples:

- `Editor`
- `PostOwner`
- `CommentOwner`

These restrict actions based on role or ownership.

### Request validation
Some middleware classes validate incoming data before allowing the request to continue.

The `Editor` middleware template is a good example. It validates request fields and uploaded image constraints before continuing.

### HTTP basic auth
The Toolkit template includes `BasicAuth`, which protects routes using HTTP basic authentication.

## Web and API middleware behave differently

The upstream templates show an important pattern.

### Web middleware
Often redirects the user when access fails.

For example:

- redirect unauthenticated users to sign-in
- redirect authenticated users away from guest-only pages
- flash validation errors and redirect back

### API middleware
Usually returns JSON errors instead.

For example:

- unauthorized requests return a JSON error response
- validation failures return structured error payloads

This is an important lesson: middleware behavior should fit the kind of application surface you are building.

## Complete middleware class example

A middleware doc should not stop at the method signature. It should also show a full class example grounded in the real upstream templates.

Here is the actual structure used by the upstream `Auth` middleware template:

```php
<?php

namespace {{MODULE_NAMESPACE}}\Middlewares;

use Quantum\Middleware\Middleware;
use Quantum\Http\Response;
use Quantum\Http\Request;
use Closure;

class Auth extends Middleware
{
    public function apply(Request $request, Closure $next): Response
    {
        if (!auth()->check()) {
            redirect(base_url(true) . '/' . current_lang() . '/signin');
        }

        return $next($request);
    }
}
```

What this real template example shows:

- middleware classes live in the module `Middlewares` namespace
- they extend `Quantum\Middleware\Middleware`
- they receive `Request` and `Closure $next`
- they can stop the request with a redirect
- they continue the pipeline with `$next($request)`

This is much closer to what you actually generate in Quantum than a generic framework-style example.

If you want more advanced middleware examples, the upstream templates also include `Editor`, `PostOwner`, and `CommentOwner`, which build on validation and ownership checks through a shared `BaseMiddleware`.

## Base middleware classes

The demo templates include `BaseMiddleware` classes for both web and API modules.

These base classes help share things like:

- validator setup
- request validation logic
- common error response behavior

That is useful because real applications often have many middlewares, and repeated validation or response code becomes messy fast.

## Middleware order

Quantum's `MiddlewareManager` processes the middleware queue in order.

So if a route has several middlewares attached, they run one after another.

That matters because the first middleware that blocks or redirects can prevent the rest of the pipeline from running.

## What happens when middleware fails

A middleware can stop the request in different ways, depending on how it is written.

From the upstream templates, common outcomes include:

- redirecting the user
- returning a JSON error
- sending a 401 response
- stopping further execution

So middleware is not only about validation. It is also a control point for access and response flow.

## Practical view

A useful way to think about middleware in Quantum is:

- routes decide where the request wants to go
- middleware decides whether the request is allowed to continue
- controllers handle the request only after middleware passes

## What to read next

After middleware, good next steps are:

- [Request Handling](request.md)
- [Modules](modules.md)
- [First App](../getting-started/first-app.md)
