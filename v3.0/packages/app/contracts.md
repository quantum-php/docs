# App Contracts

This page covers the runtime guarantees and constraints developers can rely on when booting Quantum.

## `AppFactory::create(string $type, string $baseDir)`

Creates or returns the shared `App` instance for the requested type.

### Inputs

- `$type` must be `web` or `console`
- `$baseDir` should be the project root Quantum should treat as `base_dir()`

### Guarantees

- the returned object wraps the selected adapter, already booted
- a new DI container is created only for the first instance of each type
- the created `AppContext` is stored globally on `App`

### Caveat: cache key is only the app type

If you call:

```php
AppFactory::create('web', '/project-a');
AppFactory::create('web', '/project-b');
```

both calls reuse the same cached `web` app instance until you destroy it.

## `AppFactory::destroy(string $type)`

Removes the cached instance for one app type.

Use it when a long-running process or test suite needs a fresh boot cycle for the same adapter type.

## `App::__call()` proxy behavior

`App` forwards unknown method calls to its adapter.

That lets code call:

```php
$app->start();
```

without exposing the adapter directly.

If the adapter does not implement the requested method, the call throws an app exception instead of silently ignoring it.

## `AppInterface`

Both adapters implement `Quantum\App\Contracts\AppInterface`:

- `boot(): void` runs the boot pipeline
- `start(): ?int` runs the runtime pipeline and returns the exit code

Creating an adapter does not boot it; the constructor only stores the context. `AppFactory` calls `boot()` for you. Code that creates an adapter directly must call it before `start()`:

```php
$adapter = new WebAppAdapter($context);
$adapter->boot();
$adapter->start();
```

No adapter catches exceptions: a failing stage, in the boot or in the run, throws to the caller.

## `AppContext`

`AppContext` is the bridge between bootstrap and runtime packages.

### What it exposes

- base directory (`getBaseDir()`)
- DI container (`getContainer()`)
- app type (`getType()`): `AppType::WEB` or `AppType::CONSOLE`
- DI-resolved `Environment` (`getEnvironment()`)
- DI-resolved `Config` (`getConfig()`)
- the run state: `stop()` / `isStopped()` and the exit code (`getExitCode()` / `setExitCode()`, `ExitCode::SUCCESS` by default)

The services are what both the web and the console boot provide.

### Creating one yourself

`AppFactory` builds the context for you. A test or a custom bootstrap that creates one directly passes the app type as the third, required argument:

```php
use Quantum\App\Enums\AppType;
use Quantum\Di\DiContainer;
use Quantum\App\AppContext;

$context = new AppContext($baseDir, new DiContainer(), AppType::CONSOLE);
```

There is no default, so a context built by hand is never taken for the web app by accident. Code that needs to know which app is running asks [`is_web_app()` or `is_console_app()`](helpers.md#is_web_app-and-is_console_app).

### Runtime contexts

`WebContext` and `ConsoleContext` extend `AppContext` and add what only their kind of run has:

- `WebContext`: `getRequest()`, `getRoutes()` and `getViewCache()` from the container, `getMatchedRoute()` from the request, and the response to send (`getResponse()` / `setResponse()`)
- `ConsoleContext`: `getApplication()`, `getInput()` and `getOutput()` from the container

A runtime context is built from the `AppContext` with the same base directory, container and app type, but its own run state: a stop in the boot does not carry over into the run.

### Constraint

Those typed getters assume the corresponding object has already been registered in the container. If you call them before the relevant boot stage runs, the container throws because the dependency is not registered.

## Stage and pipeline contract

Every stage implements `Quantum\App\Contracts\StageInterface` and states the context it works with in its class docblock:

```php
/**
 * @implements StageInterface<WebContext>
 */
class MyStage implements StageInterface
{
    /**
     * @param WebContext $context
     */
    public function process(AppContext $context): void
    {
        // ...
    }
}
```

`Quantum\App\Pipeline` runs stages in order with one context, and optionally a closing stage:

```php
(new Pipeline([new FirstStage(), new SecondStage()], new ClosingStage()))->run($context);
```

- The context type is a PHPDoc template (`Pipeline<TContext>`, `StageInterface<TContext>`), checked by PHPStan: running web stages with a console context, mixing stages of different kinds, or a stage without its `@implements` line fails static analysis. PHP itself only requires an `AppContext`.
- The constructor throws `InvalidArgumentException` immediately when an item does not implement `StageInterface`.
- A stage that calls `$context->stop()` ends the run after it finishes: no later stage runs or dispatches events.
- The closing stage runs last, also after a stop. It does not run when a stage throws: the exception reaches the caller.
- A stage may declare `BEFORE` and `AFTER` class constants holding event names. The pipeline dispatches them around the stage with `['context' => $context]` as the payload, the closing stage included. A stage that throws dispatches no `AFTER`; a stage that stops dispatches its `AFTER` before the run ends.

## Lifecycle events

Only the runtime stages declare events; the boot stages declare none.

| Stage | Events |
|---|---|
| `HandlePreflightStage` | `web.preflight.before`, `web.preflight.after` |
| `ResolveRouteStage` | `web.route.before`, `web.route.after` |
| `HandleRouteNotFoundStage` | `web.not_found.before`, `web.not_found.after` |
| `PrepareRequestStage` | `web.prepare.before`, `web.prepare.after` |
| `DispatchRequestStage` | `web.dispatch.before`, `web.dispatch.after` |
| `SendResponseStage` (closing stage) | `web.send.before`, `web.send.after` |
| `RunCommandStage` | `console.command.before`, `console.command.after` |

The payload's `context` is the `WebContext` or the `ConsoleContext` of the run. Which events a request fires:

| Request | Events, in order |
|---|---|
| a matched route | every `web.*` pair above, from `web.preflight` to `web.send` |
| `OPTIONS` | `web.preflight`, `web.send` |
| no matching route | `web.preflight`, `web.route`, `web.not_found`, `web.send` |
| a stage throws | everything before it and its `.before`; no `.after`, no `web.send` |

- `web.send.after` fires after the response is sent and the request's route and input are cleared; read what you need from the request earlier.
- `console.command.after` fires only with a Symfony application that does not exit after the command. The default one ends the process inside `Application::run()`, so in `php qt` only `console.command.before` fires.

## Exit codes

The package exposes three constants:

- `ExitCode::SUCCESS` = `0`
- `ExitCode::FAILURE` = `1`
- `ExitCode::INVALID` = `2`

The web adapter returns `SUCCESS` after sending a response. The console adapter returns the exit code of the command that ran, as Symfony reports it.
