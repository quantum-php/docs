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

- base directory
- DI container
- DI-resolved `Environment`
- DI-resolved `Config`
- DI-resolved `Request`
- DI-resolved `Response`
- DI-resolved `RouteCollection`

### Constraint

Those typed getters assume the corresponding object has already been registered in the container. If you call them before the relevant boot stage runs, resolution depends on the DI package being able to build that class.

## Boot stage contract

Every boot stage must implement `BootStageInterface`:

```php
public function process(AppContext $context): void;
```

`BootPipeline` validates that every supplied stage implements that interface before running.

If you pass another object type into the pipeline constructor, it throws `InvalidArgumentException` immediately.

## Exit codes

The package exposes three constants:

- `ExitCode::SUCCESS` = `0`
- `ExitCode::FAILURE` = `1`
- `ExitCode::INVALID` = `2`

The built-in adapters mainly return `SUCCESS` for handled execution paths. Console command exit codes from Symfony are passed through, with falsy values normalized to `0`.
