# App

The App package is Quantum's bootstrap and runtime entry point.

Use it when you need to start either a web request lifecycle or a console command lifecycle from a project base directory.

## What the package provides

- `AppFactory` for creating the runtime entry point
- `App` as the adapter-backed application object
- `AppContext` for base-directory and DI-backed shared runtime access
- built-in `web` and `console` adapters
- bootstrap stages for helpers, environment, config, HTTP, debugger, modules, and error handling
- path and utility helpers such as `base_dir()`, `modules_dir()`, `slugify()`, and `uuid_random()`

## Quick start

### Boot a web app

```php
use Quantum\App\Factories\AppFactory;
use Quantum\App\Enums\AppType;

$app = AppFactory::create(AppType::WEB, __DIR__);
$app->start();
```

### Boot a console app

```php
use Quantum\App\Factories\AppFactory;
use Quantum\App\Enums\AppType;

$app = AppFactory::create(AppType::CONSOLE, __DIR__);
$exitCode = $app->start();
```

## When to use it

Use the App package when you are wiring framework startup itself:

- front controllers such as `public/index.php`
- CLI entry points such as `qt`
- tests or tools that need a full Quantum app instance

Most application code should use downstream packages like Router, Http, View, or Console instead of talking to App internals directly.

## Important behavior

`AppFactory::create()` caches one `App` instance per app type.

Practical effect:

- the first `web` app created in a process is reused for later `web` calls
- the first `console` app created in a process is reused for later `console` calls
- changing the base directory in a later call does not create a new instance for the same type

If you need a fresh runtime for the same type, call `AppFactory::destroy($type)` before creating it again.

