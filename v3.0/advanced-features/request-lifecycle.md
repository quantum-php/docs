# Request Lifecycle

The Quantum PHP Framework becomes much easier to reason about once you understand the full request lifecycle.

This page explains what happens from the moment a request enters the application until a response is returned.

## Why this matters

People often learn routing, controllers, and views as separate topics.
That helps at first, but real confidence comes from understanding how those parts connect.

The request lifecycle is that connection.

## High-level flow

A simple view of the flow looks like this:

1. a request enters the application.
2. Quantum boots the required framework pieces.
3. The system checks the request method; `OPTIONS` requests short-circuit to a `204 No Content` response.
4. The router matches the request (or returns a `404`).
5. Route middleware runs.
6. The framework checks the view cache for a response; if hit, the response is served, skipping controller dispatch.
7. If no cache exists, the controller action is dispatched.
8. The response is prepared.
9. Output is returned to the client.

### The Bootstrapping Pipeline

Before a request is processed, the `WebAppAdapter` executes a pre-dispatch bootstrap flow:

1. `LoadHelpersStage`: Initializes helper functions.
2. `LoadEnvironmentStage`: Loads environment variables.
3. `LoadAppConfigStage`: Loads application configurations.
4. `SetupErrorHandlerStage`: Configures global error handling.
5. `InitHttpStage`: Initializes HTTP request/response objects.
6. `InitDebuggerStage`: Sets up the debugging environment.
7. `LoadModulesStage`: Boots registered application modules.

This sequence ensures the execution environment is fully prepared before the router attempts to match the URL.


## 1. The request enters the application

Every HTTP request starts from the public entry point of the app.

At this stage, Quantum needs to:

- load configuration
- bootstrap the framework services needed for the request
- prepare request and response objects

Before routing occurs, the `WebAppAdapter` checks the request method. If it is `OPTIONS`, the framework returns a `204 No Content` response immediately, bypassing all further processing.

## 2. The router tries to match the request

Once the application is ready, Quantum checks the request against the registered routes.

If no route matches, the request ends in a not found response. If a route matches, the framework loads language definitions, logs debug information, and initiates the view caching component.

## 3. The matched route and conditional dispatch

The framework proceeds to middleware execution. The terminal closure of this process defines how the response is generated:

1. It attempts to serve the response from the view cache using the request URI.
2. If the cache is missed (unsupported for the URI, expired, or absent), it uses the `RouteDispatcher` to dispatch the matched controller action.

This ensures that controller logic runs only when necessary, providing a performance optimization layer.

## 4. Middleware runs before the controller action

If middleware is attached to the route, Quantum runs it before the terminal closure above is invoked.

Middleware can:

- allow the request to continue
- redirect the request
- return an error response
- validate inputs
- block unauthorized access

This is why middleware belongs in the core flow of the framework.

A request does not always go directly from route to controller.
Sometimes middleware stops it first.
If the response is served from the view cache, controller action dispatch is entirely skipped.

## 5. The controller action is dispatched

If the view cache is missed and middleware allows the request to continue, Quantum dispatches the target controller action.

At this point, the framework resolves the controller and calls the requested method.

Depending on the controller, this step may include:

- dependency injection
- before/after hooks
- request processing
- business logic
- loading data
- choosing how to respond

This is the point where framework structure meets the application logic.

## 6. The controller prepares a response

The controller usually returns one of a few common outputs:

- plain text
- rendered HTML via views
- JSON for API responses
- redirects

That output becomes the response sent back to the browser or client.

## 7. The client receives the final result

After processing is complete, Quantum sends the final response back to the requester.

That might mean:

- a rendered page appears in the browser
- JSON is returned to a frontend app
- the user is redirected to another route
- an error response is shown

## Putting the lifecycle together

A practical summary looks like this:

- the framework boots
- the router finds a route
- middleware checks the request
- the controller handles the work
- a response is returned

If you understand that sequence, many other docs pages become easier immediately.

## Example mental flow

Imagine a user visits `/dashboard`.

A likely flow is:

1. Quantum receives the request
2. the router matches `/dashboard`
3. `Auth` middleware checks whether the user is logged in
4. if allowed, `DashboardController@index` runs
5. the controller loads data and renders a dashboard view
6. the browser receives the HTML response

That is the request lifecycle in action.

## Where people often get confused

A few mistakes are common.

### Confusing routing with execution
Routes describe the destination. They do not do all the work themselves.

### Forgetting middleware in the middle
Many people jump straight from route to controller. In real apps, middleware often sits in between.

### Treating views as independent from controllers
Views are usually part of the response chosen by the controller, not a separate routing destination.

## What to read next

To understand the lifecycle better, read these together:

- [Routing](../core-concepts/routing.md)
- [Controllers](../core-concepts/controllers.md)
- [Views](../core-concepts/views.md)
- [Middleware](../core-concepts/middleware.md)
- [Modules](../core-concepts/modules.md)
- [Request Parsing Contract](../core-concepts/request.md#input-merge-precedence)
