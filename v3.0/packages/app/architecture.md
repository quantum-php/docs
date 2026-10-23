# App Architecture

Whether a browser requests a page or you run `php qt migration:migrate`, Quantum does the same two things: it boots the project once, then handles one run (a request or a command). Both parts are pipelines: short, ordered lists of stages, each doing one job. That makes the order easy to read, easy to test stage by stage, and gives you fixed points to hook into.

This page follows that path: the factory that creates the app, the context every stage receives, then the stages in the order they run.

## 1) Factory

`AppFactory` is the public entry point.

```php
$app = AppFactory::create(AppType::WEB, __DIR__);
```

It does four things:

1. validates the requested adapter type
2. creates a new `DiContainer` and `AppContext`
3. creates the adapter and boots it with `boot()`
4. wraps the adapter in `Quantum\App\App`

So the app you get back is already booted, and `start()` handles the run. The factory also stores the created app in a static cache keyed by app type.

## 2) Shared context

`AppContext` carries the application base directory, the app type (web or console) and the DI container used to resolve shared services. From that context, code can resolve the objects both the web and the console boot provide:

- `Environment`
- `Config`

It also carries the state of the run it is passed through: whether a stage ended the run early (`stop()` / `isStopped()`) and the exit code.

`App` also stores the current context statically. Helpers like `base_dir()` depend on that global context being initialized first.

Each run also gets a runtime context that extends `AppContext` with what only that kind of app has. See [Runtime contexts](#runtime-contexts).

## 3) Adapter pipelines

Each adapter runs two pipelines, both with the generic `Quantum\App\Pipeline`:

- the **boot** pipeline, in `boot()`, with the shared `AppContext`
- the **runtime** pipeline, in `start()`, with a new runtime context (`WebContext` or `ConsoleContext`)

The stages run in order, and each receives the context. A stage can end the run early: an `OPTIONS` request, for example, is fully answered by the first web stage, so it calls `$context->stop()` and the stages that would match a route and dispatch it are skipped. Some work still has to happen after such an early end, so a pipeline can have a **closing stage** that runs last in any case: the web runtime uses it to send the response.

A stop ends only its own pipeline. When a boot stage stops, the rest of the boot is skipped, but `start()` still runs; the console uses this when `.env` cannot be loaded, see [Console boot order](#console-boot-order).

The exact rules are in [Contracts](contracts.md#stage-and-pipeline-contract).

### Hooking into the running app

Say you want to add a header to every response, or log which console command ran. The runtime stages dispatch events around themselves, such as `web.send.before` and `console.command.before`, with the runtime context in the payload.

Listen in a file under your project's `helpers/` directory. Helpers load early in the boot, so the listener is in place before the first request or command is handled:

```php
// helpers/events.php
event()->listen('web.send.before', function (array $payload) {
    $payload['context']->getResponse()->setHeader('X-Served-By', 'Quantum');
});

event()->listen('console.command.before', function (array $payload) {
    $command = $payload['context']->getInput()->getFirstArgument();

    // ...
});
```

A stage that does not run fires no events, so a listener never has to check whether the request was stopped. The send stage is the closing stage, so the header above is also added to a `404` and an `OPTIONS` response.

The boot stages dispatch no events: the boot is the framework's own setup, and app code hooks in once it is finished. The first event of a request is `web.preflight.before`, and the first event of a command is `console.command.before`.

The full list of events and the order they fire in is in [Contracts](contracts.md#lifecycle-events).

## Web boot order

`boot()` runs these stages:

1. `LoadHelpersStage`
2. `LoadEnvironmentStage`
3. `LoadAppConfigStage`
4. `SetupErrorHandlerStage`
5. `InitHttpStage`
6. `LoadModulesStage`

## Web runtime order

`start()` runs these stages with a `WebContext`:

1. `HandlePreflightStage`: `OPTIONS` requests get `204 No Content`, and the run stops
2. `ResolveRouteStage`: matches the request against the loaded module routes and stores the match on the request
3. `HandleRouteNotFoundStage`: a request without a match gets Quantum's not-found response, and the run stops
4. `PrepareRequestStage`: resolves the Lang package (translations load on first use) and sets up the view cache when it is enabled
5. `DispatchRequestStage`: middleware wraps the route dispatch or the cached response lookup

`SendResponseStage` is the closing stage: it appends the CORS headers, sends the response, and clears the request's route and input state, also when sending fails. It runs after a stop too, so the `204` and the not-found response are sent the same way.

## Console boot order

`boot()` runs these stages:

1. `InitConsoleStage`: registers the Symfony application, the input and the output
2. `LoadHelpersStage`
3. `RegisterCoreCommandsStage`: registers the framework's commands
4. `ResolveEnvironmentStage`: decides what happens when `.env` cannot be loaded
5. `LoadEnvironmentStage`
6. `LoadAppConfigStage`
7. `SetupErrorHandlerStage`
8. `SetupConsoleApplicationStage`: names the application from `app.name` and `app.version`
9. `RegisterAppCommandsStage`: registers your commands from `shared/Commands`

`ResolveEnvironmentStage` loads `.env` once to see whether it works. If it does not, the stage stops the boot for a command that can run without the environment, and lets every other command fail with the error; which commands those are is in [Commands without a working environment](../../cli/qt-command-line-tool.md#commands-without-a-working-environment).

The framework's commands are registered before the environment so that `core:env` can be found when `.env` cannot be loaded; their constructors therefore use neither the environment nor the config. Your commands are registered last, after the environment, the config and the error handler, so their constructors can use `env()` and `config()`.

## Console runtime order

`start()` runs one stage with a `ConsoleContext`:

1. `RunCommandStage`: rejects a missing or unknown command (``Command `<name>` is not defined``), and otherwise runs the command and keeps its exit code

## Runtime contexts

`WebContext` and `ConsoleContext` extend `AppContext`, with the same base directory, container and app type.

- `WebContext` reads the request, the routes, and the view cache from the container, and the matched route from the request. It stores the response to send.
- `ConsoleContext` reads the Symfony application, input, and output from the container.

Both keep the stop flag and the exit code of their run, which they inherit from `AppContext`.

## Where the stages live

A stage that both adapters run is in `Quantum\App\Stages\Boot`: `LoadHelpersStage`, `LoadEnvironmentStage`, `LoadAppConfigStage` and `SetupErrorHandlerStage`. A stage that only one adapter runs lives next to that adapter, in `Quantum\App\Adapters\Web\Stages\Boot`, `...\Web\Stages\Runtime`, `...\Console\Stages\Boot` or `...\Console\Stages\Runtime`.

## Command discovery model

The console boot registers commands from two places:

- framework commands under `vendor/quantum/framework/src/Console/Commands` (namespace `Quantum\Console\Commands`)
- application commands under `shared/Commands` (namespace `Shared\Commands`)

Each discovered command class is instantiated with no constructor arguments before being added to the Symfony application, so command classes must be instantiable without runtime constructor dependencies.
