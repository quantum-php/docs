# App Architecture

The App package builds a runtime in three layers: factory, context, and adapter pipelines.

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

From that context, code can resolve the objects both the web and the console boot provide:

- `Environment`
- `Config`

`App` also stores the current context statically. Helpers like `base_dir()` depend on that global context being initialized first.

Each run also gets a runtime context that extends `AppContext` with what only that kind of app has. See [Runtime contexts](#runtime-contexts).

## 3) Adapter pipelines

Each adapter runs two pipelines, both with the generic `Quantum\App\Pipeline`:

- the **boot** pipeline, during construction, with the shared `AppContext`
- the **runtime** pipeline, in `start()`, with a runtime context (`WebContext` or `ConsoleContext`)

The pipeline contract is simple: every stage receives the context and runs once, in order. A stage may declare `BEFORE` / `AFTER` event names that the pipeline dispatches around it; see [Contracts](contracts.md#stage-and-pipeline-contract).

## Web boot order

The web adapter runs these stages during construction:

1. `LoadHelpersStage`
2. `LoadEnvironmentStage`
3. `LoadAppConfigStage`
4. `SetupErrorHandlerStage`
5. `InitHttpStage`
6. `InitDebuggerStage`
7. `LoadModulesStage`

## Web runtime order

After boot, `start()` runs these stages with a `WebContext`:

1. `HandlePreflightStage`: `OPTIONS` requests get `204 No Content`, and the remaining stages up to sending are skipped
2. `ResolveRouteStage`: matches the request against the loaded module routes and stores the match on the request
3. `HandleRouteNotFoundStage`: a request without a match gets Quantum's not-found response, and the remaining stages up to sending are skipped
4. `PrepareRequestStage`: resolves the Lang package (translations load on first use), logs the registered events to the debugbar in debug mode, and sets up the view cache when it is enabled
5. `DispatchRequestStage`: middleware wraps the route dispatch or the cached response lookup
6. `SendResponseStage`: appends the CORS headers, sends the response, and clears the request's route and input state, also when sending fails

## Console boot order

The console adapter runs these stages during construction:

1. `InitConsoleStage`
2. `LoadHelpersStage`
3. `LoadEnvironmentStage`
4. `LoadAppConfigStage`
5. `SetupErrorHandlerStage`
6. `SetupConsoleApplicationStage`

`InitConsoleStage` runs first so a console application, input, and output exist even when a later stage fails. The boot runs for every command. When it fails, the adapter keeps the failure instead of stopping: commands that do not need the environment, such as `core:env`, `list`, and `help`, still run, and a command that needs it gets the original error. `SetupConsoleApplicationStage` names the Symfony application from `app.name` and `app.version`; after a failed boot it is not reached and the name stays `UNKNOWN`.

## Console runtime order

`start()` runs these stages with a `ConsoleContext`:

1. `RegisterCoreCommandsStage`
2. `RegisterAppCommandsStage`
3. `RunCommandStage`: rejects a missing or unknown command (``Command `<name>` is not defined``), re-throws the boot failure for a command that requires the environment, and otherwise runs the command and keeps its exit code

## Runtime contexts

`WebContext` and `ConsoleContext` extend `AppContext`, with the same base directory and container.

- `WebContext` reads the request, the routes, and the view cache from the container, and the matched route from the request. It stores what the run produces: the response to send and whether the run was stopped early.
- `ConsoleContext` reads the Symfony application, input, and output from the container. It stores the boot failure, if any, and the command's exit code.

## Command discovery model

The console runtime registers commands from two places:

- framework commands under `vendor/quantum/framework/src/Console/Commands` (namespace `Quantum\Console\Commands`)
- application commands under `shared/Commands` (namespace `Shared\Commands`)

Each discovered command class is instantiated with no constructor arguments before being added to the Symfony application, so command classes must be instantiable without runtime constructor dependencies.
