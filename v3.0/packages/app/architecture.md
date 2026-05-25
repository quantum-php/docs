# App Architecture

The App package builds a runtime in three layers: factory, context, and adapter boot pipeline.

## 1) Factory

`AppFactory` is the public entry point.

```php
$app = AppFactory::create(AppType::WEB, __DIR__);
```

It does three things:

1. validates the requested adapter type
2. creates a new `DiContainer` and `AppContext`
3. wraps the selected adapter in `Quantum\App\App`

The factory also stores the created app in a static cache keyed by app type.

## 2) Shared context

`AppContext` carries two pieces of runtime state:

- the application base directory
- the DI container used to resolve shared services

From that context, code can resolve common runtime objects such as:

- `Environment`
- `Config`
- `Request`
- `Response`
- `RouteCollection`

`App` also stores the current context statically. Helpers like `base_dir()` depend on that global context being initialized first.

## 3) Adapter boot pipeline

Each adapter builds a `BootPipeline` with ordered stages.

The pipeline contract is simple: every stage receives the shared `AppContext` and runs once in sequence.

## Web boot order

The web adapter runs these stages during construction:

1. `LoadHelpersStage`
2. `LoadEnvironmentStage`
3. `LoadAppConfigStage`
4. `SetupErrorHandlerStage`
5. `InitHttpStage`
6. `InitDebuggerStage`
7. `LoadModulesStage`

After boot, `start()` runs request handling:

- `OPTIONS` requests return `204 No Content`
- route matching runs against the loaded module routes
- missing routes return Quantum's not-found response
- language loading runs only when the Lang package is enabled
- middleware wraps the final route dispatch or cached response lookup
- CORS headers are appended before sending the response
- request-scoped route and input state are cleared after send

## Console boot order

The console adapter always loads helpers first.

For most commands, it then loads:

1. environment
2. app config
3. error handler

The built-in `core:env` command is the exception. It skips those extra stages, then the adapter builds the Symfony console application and registers commands.

## Command discovery model

The console runtime registers commands from two places:

- framework commands under `vendor/quantum/framework/src/Console/Commands`
- application commands under `shared/Commands`

Each discovered command class is instantiated with no constructor arguments before being added to the Symfony application, so command classes must be instantiable without runtime constructor dependencies.
