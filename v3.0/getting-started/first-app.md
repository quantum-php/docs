# First App

This guide covers the first practical step after installation.

You already know how to install the Quantum PHP Framework and start the local server.
Now the goal is to understand how a basic request becomes a response.

For a first app, you do not need every internal detail.
Start with this simple flow:

- a route matches the URL
- a controller action handles the request
- the action returns a response
- that response might be HTML or JSON

## What you should understand by the end

After this page, you should be able to explain:

- where a route is defined
- where a controller action lives
- how a route points to a controller
- how Quantum returns HTML or JSON

That gives you a working model for building real features.

## The basic request flow

A simple way to think about the framework is:

1. the browser sends a request
2. Quantum matches the request against your routes
3. middleware runs if the route uses it
4. the controller action is called
5. the action returns a response
6. the browser receives HTML or JSON

This is the core loop you will use repeatedly.

## Step 1: define a route

In Quantum, routes are usually defined in route files.

A route tells the framework:

- which URL to watch for
- which controller should handle it
- which method inside that controller should run

A route can look like this:

```php
$route->get('hello', 'HomeController', 'hello');
```

This means:

- watch for a GET request to `/hello`
- call the `hello` method on `HomeController`

## Step 2: create the controller action

A controller contains the logic for handling the request.

A simple Quantum-style action can look like this:

```php
use Quantum\Http\Response;

class HomeController
{
    public function hello(): Response
    {
        return response()->html('Hello from Quantum PHP Framework');
    }
}
```

This keeps the example aligned with Quantum's response helper flow while still showing the route-to-controller connection clearly.

## Step 3: return a view

In a normal web page flow, the controller usually prepares HTML through the response and view layer instead of returning plain text.

A Quantum-style controller can look like this:

```php
use Quantum\View\Factories\ViewFactory;
use Quantum\Http\Response;

public function hello(ViewFactory $view): Response
{
    return response()->html($view->render('home/hello'));
}
```

The controller delegates HTML rendering to the view layer and sends it through the response object.

This is a cleaner pattern than building HTML directly inside the controller.

## Step 4: return JSON

For APIs or asynchronous requests, the controller may return JSON instead.

A Quantum-style response flow can look like this:

```php
use Quantum\Http\Response;

public function profile(): Response
{
    return response()->json([
        'name' => 'John Doe',
        'framework' => 'Quantum PHP Framework'
    ]);
}
```

The exact response style depends on your app structure and helpers, but the core idea stays the same:

- web routes often return views
- API-style routes often return JSON

## A practical way to think about it

If you need a quick mental model, remember this:

- routing decides where the request goes
- middleware decides whether it can continue
- controllers do the work
- views render HTML
- JSON responses power APIs and dynamic frontend calls

That is enough to continue through the docs without losing context.

## What people usually misunderstand

A few common points are worth clearing up early.

### 1. Routes do not contain the full application logic
Routes should describe request mapping, not become the entire app.

### 2. Controllers are not views
Controllers prepare and coordinate. Views handle presentation.

### 3. HTML and JSON are both valid first outputs
Your first app does not have to be page-only. Quantum supports both traditional web flows and API-style responses.

### 4. Middleware is part of the request path
Even in small apps, middleware often appears quickly for auth, guest access, validation, or ownership checks.

## Suggested next reading

To deepen this basic flow, read these next:

1. [Project Structure](project-structure.md)
2. [Routing](../core-concepts/routing.md)
3. [Controllers](../core-concepts/controllers.md)
4. [Views](../core-concepts/views.md)
5. [Middleware](../core-concepts/middleware.md)

Once these topics make sense together, you are ready to read and build confidently with Quantum.
