# App Adapters

Quantum ships two built-in app adapters: `web` and `console`.

Both follow the same lifecycle, `boot()` and then `start(): ?int` (see [Contracts](contracts.md#appinterface)), but they boot different runtime services and handle different entry-point work.

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

Every `php qt <command>` goes the same way: the adapter boots the project (helpers, the framework commands, `.env`, app config, error handler, then your commands from `shared/Commands`), checks that the requested command exists, runs it through Symfony Console, and returns its exit code.

On a fresh clone without `.env`, or with a malformed one, `core:env`, `list` and `help` still run, and every other command stops with the error of the environment file; see [Commands without a working environment](../../cli/qt-command-line-tool.md#commands-without-a-working-environment).

The adapter does not make the environment writable. A command that changes `.env` through `environment()->updateRow()` calls `setMutable(true)` first, as `core:key` does.

The stages behind these steps are listed in [Architecture](architecture.md#console-boot-order).

### Command registration contract

App commands are discovered only from `shared/Commands`.

Framework commands are discovered from the framework's own `Console/Commands` directory.

Discovered classes are instantiated directly, so constructor-injected command dependencies are not part of this adapter's command-loading model.

Your commands are created at the end of the boot, after the environment, the config and the error handler, so their constructors can use `env()` and `config()`. The framework's commands are created before the environment, so that `core:env` can run without it.

## Unsupported adapter types

`AppFactory::create()` accepts only:

- `AppType::WEB` (`web`)
- `AppType::CONSOLE` (`console`)

Any other type fails fast with an app exception.
