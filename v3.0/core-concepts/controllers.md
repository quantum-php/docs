# Controllers

Controllers are the part of the Quantum PHP Framework that handle a matched request and decide what should happen next.

In practice, a route usually points to a controller class and an action method. When the request matches, Quantum creates the controller and runs that action.

## Core idea

A controller sits between the route and the response.

A simple flow looks like this:

1. a route matches the request
2. Quantum resolves the controller and action
3. the controller reads input or receives injected dependencies
4. the controller prepares a response

That response might be:

- HTML
- JSON
- a redirect
- another HTTP response type

## How controllers are called

From the upstream routing code, Quantum dispatches controller routes by:

1. reading the controller class and action from the matched route
2. instantiating the controller
3. verifying the action exists
4. autowiring action parameters through Quantum's DI system
5. calling the action

This means controller actions can receive useful dependencies directly.

## What a controller route looks like

A route definition such as:

```php
$route->get('posts', 'PostController', 'posts');
```

means Quantum will dispatch to something equivalent to:

```php
PostController::posts()
```

inside the current module namespace.

## Example: a simple API controller

From the upstream default API module template:

```php
class MainController
{
    public bool $csrfVerification = false;

    public function index(): Response
    {
        return response()->json([
            'status' => 'success',
            'message' => 'Module name module.'
        ]);
    }
}
```

This shows a few important ideas:

- the action returns a `Response` object
- the controller can return JSON directly
- CSRF behavior can be controlled on the controller

## Example: a simple web controller

From the upstream default web module template:

```php
class MainController
{
    const LAYOUT = 'layouts/main';

    public function __before(ViewFactory $view)
    {
        $view->setLayout(static::LAYOUT, [
            // assets...
        ]);
    }

    public function index(ViewFactory $view): Response
    {
        $view->setParams([
            'title' => config()->get('app.name'),
        ]);

        return response()->html($view->render('index'));
    }
}
```

This is useful because it shows the web-side controller pattern clearly:

- set up layout in `__before`
- pass data into the view
- render HTML through the response

## Controller lifecycle hooks

Quantum supports two optional controller hook methods:

- `__before`
- `__after`

If they exist, the route dispatcher calls them around the action.

This makes controllers more flexible for shared preparation and cleanup logic.

A common use case is setting the layout or loading common page data in `__before`.

## Dependency injection in actions

The dispatcher uses DI autowiring when invoking controller actions.

That means action methods can receive framework services and other dependencies directly, instead of manually constructing everything inside the method.

In practical terms, you will often see action parameters such as:

- `Response $response`
- `ViewFactory $view`
- request-related values resolved from the route or DI system

This keeps controllers cleaner and more focused.

## Controllers and CSRF verification

Quantum's dispatcher checks a controller property named `csrfVerification`.

If that property is enabled and the request method requires CSRF checking, the framework verifies the token before the action runs.

So controller classes can participate directly in request protection.

## Controllers and modules

In Quantum, controllers are usually part of a module.

From the module templates, controllers live under paths like:

```text
modules/<ModuleName>/src/Controllers/
```

Examples from the upstream templates include:

- `MainController`
- `AuthController`
- `PostController`
- `CommentController`
- `AccountController`
- `DashboardController`

This is another sign that Quantum organizes request handling through modules rather than one flat controller directory.

## Controllers should stay focused

A good habit is to keep controllers focused on coordination.

In other words, controllers should usually:

- receive the request context
- call the needed services
- pass data to a response or view

They should usually not become the main place where all business logic lives.

The upstream project reinforces this by also having:

- services
- DTOs
- models
- transformers

That broader structure helps keep controllers from becoming too large.

## Web controllers vs API controllers

Quantum supports both styles clearly.

### Web controllers
Usually:

- prepare layouts
- render views
- return HTML

### API controllers
Usually:

- work with JSON responses
- handle tokens, auth flows, and data endpoints
- use middlewares heavily for endpoint protection

Both styles follow the same routing and dispatch system.

## Practical view

The simplest useful way to think about it is:

- routes decide *which controller action runs*
- controllers decide *what the application does for that request*
- services, models, and views help the controller do that cleanly

## What to read next

After controllers, continue with:

- [Views](views.md)
- [Middleware](middleware.md)
- [Services](services.md)
