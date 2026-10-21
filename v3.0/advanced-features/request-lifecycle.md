# Request Lifecycle

The Quantum PHP Framework becomes much easier to reason about once you understand the full request lifecycle.

This page explains what happens from the moment a request enters the application until a response is returned.

## Why this matters

People often learn routing, controllers, and views as separate topics.
That helps at first, but real confidence comes from understanding how those parts connect.

The request lifecycle is that connection.

## High-level flow

Follow one request, `GET /dashboard`, from the browser to the response:

1. Quantum boots the project: helpers, `.env`, config, the error handler, request and response, the debugger, and the modules with their routes.
2. A browser's CORS preflight (`OPTIONS`) is answered right away with `204 No Content`.
3. The router looks for a route matching `/dashboard`. If there is none, the visitor gets a 404.
4. The route matched, so Quantum detects the language and prepares the view cache.
5. The route's middleware runs, for example `Auth`. It can let the request through or answer itself.
6. If the page is in the view cache, that copy is the response. Otherwise the controller action runs.
7. The response is sent with the CORS headers from `config/cors`.

Each of these steps is a stage in a pipeline. The stage names and their exact order are listed in [App Architecture](../packages/app/architecture.md#web-boot-order), and the events each step dispatches for your own listeners are in [Hooking into the running app](../packages/app/architecture.md#hooking-into-the-running-app).

## 1. The request enters the application

Every HTTP request starts from the public entry point of the app.

Before Quantum looks at the URL, the boot has loaded the configuration, the framework services and the module routes, and created the request and response objects.

The first thing Quantum checks is the method. A browser sends an `OPTIONS` preflight before some cross-origin requests to ask what is allowed. Quantum answers it with `204 No Content` and the CORS headers, and skips routing, middleware and the controller.

## 2. The router tries to match the request

Quantum checks the request against the routes the modules registered.

If no route matches, the request ends in a 404. A browser gets your HTML error page, and an API client gets JSON; see [`page_not_found_response()`](../packages/http/helpers.md).

If a route matches, Quantum prepares what the rest of the request may need: it detects the language from the request (translations load on the first `t()` call), writes the registered event listeners to the debug bar when it is enabled, and sets up the view cache when it is enabled. A 404 does none of this work.

## 3. Middleware runs before the controller action

If middleware is attached to the route, Quantum runs it first.

Middleware can:

- allow the request to continue
- redirect the request
- return an error response
- validate inputs
- block unauthorized access

A request does not always go from route to controller: sometimes middleware answers first, and the controller never runs.

## 4. The view cache or the controller

When the middleware lets the request through, Quantum first looks for a cached copy of the page under the request URI. On a hit, that copy is the response and the controller is skipped. On a miss (caching is off, the entry is missing or has expired), the controller action is dispatched.

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

After processing is complete, Quantum adds the CORS headers from `config/cors`, sends the final response back to the requester, and clears the request state.

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
