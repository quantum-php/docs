# App Usage

Use the App package in entry points, not inside normal feature code.

## Web entry point

A typical front controller creates the app and starts it:

```php
use Quantum\App\Enums\AppType;
use Quantum\App\Factories\AppFactory;

require_once __DIR__ . '/../vendor/autoload.php';

$app = AppFactory::create(AppType::WEB, dirname(__DIR__));
$app->start();
```

What happens next:

- helpers, environment, and config are loaded
- request and response services are prepared
- modules register routes
- the current request is matched and dispatched

## Console entry point

For CLI bootstraps, use the console adapter:

```php
use Quantum\App\Enums\AppType;
use Quantum\App\Factories\AppFactory;

require_once __DIR__ . '/vendor/autoload.php';

$app = AppFactory::create(AppType::CONSOLE, __DIR__);
exit($app->start() ?? 0);
```

Quantum will discover:

- framework console commands
- application commands from `shared/Commands`

## Getting runtime paths

Once the app context exists, path helpers are available anywhere helpers have been loaded:

```php
$cacheDir = public_dir() . '/cache';
$moduleRoot = modules_dir();
```

## Resetting the runtime in tests

Because the factory caches one app per type, tests that need a new base directory or a fresh boot state should destroy the cached app first.

That same refresh pattern is useful in long-running tooling that switches between fixture projects or between repeated bootstrap cycles.

```php
use Quantum\App\Enums\AppType;
use Quantum\App\Factories\AppFactory;

AppFactory::destroy(AppType::WEB);
$app = AppFactory::create(AppType::WEB, $fixtureProjectRoot);
```

## Common pitfalls

### Reusing the same adapter type across projects

If the same PHP process boots two different projects with the same adapter type, the second call reuses the first cached instance unless you destroy it.

### Calling path helpers too early

Helpers like `base_dir()` and `public_dir()` are available after `AppFactory::create()` has initialized `AppContext`.

### Constructor-heavy console commands

The console adapter instantiates discovered command classes directly. If a command requires constructor arguments, it will not fit the built-in registration flow.

## Related next steps

- [Adapters](adapters.md)
- [Contracts](contracts.md)
- [Console Commands](../../cli/console-commands.md)
- [Request Lifecycle](../../advanced-features/request-lifecycle.md)
