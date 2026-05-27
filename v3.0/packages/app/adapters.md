# App Adapters

Quantum ships two built-in app adapters: `web` and `console`.

Both satisfy the same `start(): ?int` contract, but they boot different runtime services and handle different entry-point work.

## Web adapter

Use the web adapter for HTTP traffic.

```php
use Quantum\App\Enums\AppType;
use Quantum\App\Factories\AppFactory;

$app = AppFactory::create(AppType::WEB, __DIR__);
$app->start();
```

### What it does

The web adapter:

- loads framework, app, and module helpers
- loads environment and app config
- installs the error handler
- registers request and response objects in DI
- initializes the debugger store
- loads module routes into a `RouteCollection`
- matches the current request and dispatches it through middleware

### Web response behavior

A few web behaviors are worth planning for:

- `OPTIONS` requests short-circuit to `204 No Content`
- missing routes return a not-found response instead of throwing
- view cache is consulted before route dispatch when `ViewCache` is enabled
- CORS headers are loaded from `config/cors` on first response send
- request state is flushed after the response is sent

## Console adapter

Use the console adapter for the `qt` entry point or any custom CLI bootstrap.

```php
use Quantum\App\Enums\AppType;
use Quantum\App\Factories\AppFactory;

$app = AppFactory::create(AppType::CONSOLE, __DIR__);
exit($app->start() ?? 0);
```

### What it does

The console adapter:

- creates Symfony `ArgvInput` and `ConsoleOutput`
- loads helpers for every command
- loads environment, app config, and error handling for commands other than `core:env`
- marks the shared `Environment` instance mutable for commands other than `core:env`
- creates the Symfony application using `app.name` and `app.version`
- registers framework and app command classes
- validates that the requested command exists before running

### `core:env` bootstrap path

For `core:env`, the adapter runs only the helper-loading stage before creating the Symfony application.

Because app config is skipped in this path, `app.name` and `app.version` resolve through adapter fallback values when those config values are not available yet.

### Command registration contract

App commands are discovered from `shared/Commands`.

Framework commands are discovered from the framework's own `Console/Commands` directory.

Discovered classes are instantiated directly, so constructor-injected command dependencies are not part of this adapter's command-loading model.

## Supported adapter types

`AppFactory::create()` accepts these adapter types:

- `AppType::WEB` (`web`)
- `AppType::CONSOLE` (`console`)

Passing another type raises an app exception during creation.
