# Config Architecture

Config sits between Quantum's file loader and the rest of the framework.

## Runtime flow

1. Create a `Setup` object that points to a PHP config file.
2. Call `load()` or `import()` on `Config`.
3. Config resolves `Quantum\Loader\Loader` through DI.
4. Loader reads the PHP file and returns its array.
5. Config stores the result in one in-memory data container.

After that, reads come from memory through `get()`, `has()`, and `all()`.

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
