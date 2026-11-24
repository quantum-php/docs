# Config Architecture

Config sits between the PHP config files and the rest of the framework.

## Runtime flow

1. Create a `Setup` object that names a PHP config file.
2. Call `load()`, `import()` or `importIfExists()` on `Config`.
3. Config resolves the file path from the application base directory: the module's file first, then the `shared/` fallback (see [Path resolution](../../advanced-features/configuration.md#path-resolution-table)).
4. Config requires the PHP file, which returns an array. A missing file throws `ConfigException` (`importIfExists()` returns `false` instead).
5. Config stores the result in one in-memory data container.

After that, reads come from memory through `get()`, `has()`, and `all()`. `getBool()` and `getInt()` read through `get()` and convert the value on the way out.

## How `Config` and `ConfigSection` are organised

Two classes read config, and they share the reading code:

- `Config` is the application config. It loads and imports the config files itself (`load()`, `import()`, `importIfExists()` and the file lookup) and implements `ConfigInterface`.
- `ConfigSection` is one read-only part of it, such as `cache.redis`. It is `final` and has no method that loads or changes values.

The shared code lives in `Quantum\Config\Traits`:

- `ReadTrait`: `get()`, `has()`, `all()` and `section()`, used by both classes
- `TypedValuesTrait`: the typed readers `getBool()` and `getInt()`, used by both classes
- `WriteTrait`: `set()`, `delete()` and `flush()`, used by `Config` only

## Sections

An adapter needs its own settings, not the whole config, and it should not be able to change them. So a factory cuts out the adapter's part and passes it in:

```php
// CacheFactory, with $adapter = 'redis'
$cacheAdapter = new $adapterClass(config()->section('cache.' . $adapter));
```

`section()` copies the values under the key into a new `ConfigSection`. What that copy guarantees is listed in the [section contract](contracts.md#section-contract).

## Two storage modes

### `load()`

`load()` stores the loaded array as the root configuration payload.

That is useful when you want direct keys such as:

- `debug`
- `name`
- `timezone`

It is not a merge operation. The first successful call wins, and later `load()` calls return immediately.

### `import()`

`import()` stores the loaded array under the `Setup` filename.

For example, importing `new Setup('config', 'mailer')` makes the file available under:

- `mailer.default`
- `mailer.smtp.host`

This is the safer option when multiple packages need their own config sections in the same shared store.

## Shared helper lifecycle

The `config()` helper resolves `Config::class` from Quantum DI and registers it on first use.

That means:

- repeated helper calls reuse the same store
- `set()`, `delete()`, and `flush()` affect later helper calls in the same runtime
- package bootstrap code can import config once and let other code read it later

## Collision model

`import()` only protects the top-level section name.

If `app` has already been imported, importing another file with filename `app` fails before merge. The package does not compare nested keys one by one.

## Practical design consequence

Use Config as a runtime registry, not as a long-lived source of truth.

The source of truth stays in the PHP config files. Config is the loaded, mutable working copy for the current process.
