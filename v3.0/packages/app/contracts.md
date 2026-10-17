# App Contracts

This page covers the runtime guarantees and constraints developers can rely on when booting Quantum.

## `AppFactory::create(string $type, string $baseDir)`

Creates or returns the shared `App` instance for the requested type.

### Inputs

- `$type` must be `web` or `console`
- `$baseDir` should be the project root Quantum should treat as `base_dir()`

### Guarantees

- the returned object wraps the selected adapter
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

## `AppContext`

`AppContext` is the bridge between bootstrap and runtime packages.

### What it exposes

- base directory (`getBaseDir()`)
- DI container (`getContainer()`)
- DI-resolved `Environment` (`getEnvironment()`)
- DI-resolved `Config` (`getConfig()`)

These are what both the web and the console boot provide.

### Runtime contexts

`WebContext` and `ConsoleContext` extend `AppContext` and add what only their kind of run has:

- `WebContext`: `getRequest()`, `getRoutes()` and `getViewCache()` from the container, `getMatchedRoute()` from the request, the response to send (`getResponse()` / `setResponse()`), and `stop()` / `isStopped()`
- `ConsoleContext`: `getApplication()`, `getInput()` and `getOutput()` from the container, `getBootFailure()`, and the exit code (`getExitCode()` / `setExitCode()`)

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

`Quantum\App\Pipeline` runs stages in order with one context:

```php
(new Pipeline([new FirstStage(), new SecondStage()]))->run($context);
```

- The context type is a PHPDoc template (`Pipeline<TContext>`, `StageInterface<TContext>`), checked by PHPStan: running web stages with a console context, mixing stages of different kinds, or a stage without its `@implements` line fails static analysis. PHP itself only requires an `AppContext`.
- The constructor throws `InvalidArgumentException` immediately when an item does not implement `StageInterface`.
- A stage may declare `BEFORE` and `AFTER` class constants holding event names. The pipeline dispatches them around the stage with `['context' => $context]` as the payload, skips them while the `event()` helper is not loaded yet, and does not dispatch `AFTER` when the stage throws. Today only boot stages declare events (`boot.environment`, `boot.config`, `boot.error_handler`, `boot.http`, `boot.modules`, each with `.before` / `.after`).

## Exit codes

The package exposes three constants:

- `ExitCode::SUCCESS` = `0`
- `ExitCode::FAILURE` = `1`
- `ExitCode::INVALID` = `2`

The web adapter returns `SUCCESS` after sending a response. The console adapter returns the exit code of the command that ran, as Symfony reports it.
