# Config

The Config package gives Quantum one shared in-memory configuration store.

Use it when you want to load PHP config files through `Loader`, read values with dot notation, and override values at runtime.

## What this package does

- loads config arrays from PHP files through `Quantum\Loader\Setup`
- stores values in one dot-accessible container
- supports two loading modes: `load()` for the root store and `import()` for named config sections
- exposes a DI-backed `config()` helper for shared access

## Most applications use `import()`

Quantum's package-level config files are usually imported under their file name:

```php
use Quantum\Loader\Setup;

config()->import(new Setup('config', 'app'));
config()->import(new Setup('config', 'database'));

$appName = config()->get('app.name');
$defaultDatabase = config()->get('database.default');
```

This is the normal shape used across the framework: each imported file becomes a top-level key such as `app`, `database`, or `mailer`.

## When `load()` is a better fit

Use `load()` when you want one config file to become the entire root store instead of being nested under its filename.

```php
use Quantum\Config\Config;
use Quantum\Loader\Setup;

$config = new Config();
$config->load(new Setup('config', 'app'));

$debug = $config->get('debug');
```

With `load()`, keys come from the file directly. With `import()`, the same file would be read under `app.debug`.

## Package shape

- `Quantum\Config\Config` manages the in-memory store
- `Quantum\Config\Contracts\ConfigInterface` defines the public API
- `Quantum\Config\Helpers\config.php` exposes the shared helper
- `Quantum\Config\Exceptions\ConfigException` reports import-name collisions

## Important runtime constraints

- `config()` returns one shared `Config` instance from DI, so runtime changes are shared for the current container lifecycle.
- `load()` is one-shot. After the first successful load, later `load()` calls do nothing until you `flush()`.
- `import()` always stores loaded data under the `Setup` filename.
- Import collisions are only guarded by that top-level filename. Re-importing the same truthy filename throws a `ConfigException`.
- For predictable imports, use a real non-empty filename in `Setup`.

## Read next

- [Architecture](architecture.md)
- [Usage](usage.md)
- [Contracts](contracts.md)
- [Helpers](helpers.md)
