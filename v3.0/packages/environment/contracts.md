# Environment Contracts

`Quantum\Environment\Environment` implements `Quantum\Environment\Contracts\EnvironmentInterface`, which declares its public methods: `setMutable()`, `load()`, `getAppEnv()`, the five `is...()` checks, `getValue()`, `getBool()`, `getInt()`, `hasKey()`, `getRow()` and `updateRow()`. The `environment()` helper still returns the `Environment` class.

Beyond the interface, the package has a few strong code-level contracts.

## Load-before-read contract

`Environment::getValue()` throws `EnvException::environmentNotLoaded()` until `load()` has completed.

That means this is invalid:

```php
$value = env('APP_NAME');
```

unless the application bootstrap has already loaded the environment.

`hasKey()` and `getRow()` do not enforce the same guard. They read directly from the internal cache and simply behave as if the store is empty before load.

## Typed reader contract

`getBool()` and `getInt()` read through `getValue()`, so they throw `EnvException::environmentNotLoaded()` until `load()` has completed. For how to use them, see [Reading booleans and numbers](usage.md#reading-booleans-and-numbers).

```php
public function getBool(string $key, bool $default = false): bool;
public function getInt(string $key, int $default = 0): int;
```

- a missing key returns the default
- `getBool()` returns `true` for `true`, `1`, `on` and `yes`, ignoring letter case, and `false` for every other value, including `false`, `0`, `off`, `no` and an empty value
- `getInt()` returns the number for whole-number text such as `587`, and throws `EnvException::invalidValue()` for any other text, such as `abc`, `1.5` or an empty value
- `getValue()` and `env()` are not affected and keep returning the raw value

## One-shot load contract

`Environment::load()` returns immediately when `$loaded` is already `true`.

This is not a reload API. It is a first-load-only initializer.

## File existence contract

After choosing the target file name, `Environment::load()` checks `file_exists(...)` on `App::getBaseDir() . DS . $envFile`.

If the file is missing, it throws `EnvException::fileNotFound($envFile)`. The same exception is thrown first when `shared/config/env.php` is missing.

The package does not silently skip missing environment files.

## Mutability contract

`updateRow()` requires two preconditions:

- `setMutable(true)` must have been called
- the environment must already be loaded

If mutability is off, the method throws `EnvException::environmentImmutable()`.

If loading has not happened yet, it throws `EnvException::environmentNotLoaded()`.

## Environment-name contract

The environment predicate helpers are exact string comparisons:

- `isProduction()` checks for `production`
- `isStaging()` checks for `staging`
- `isDevelopment()` checks for `development`
- `isTesting()` checks for `testing`
- `isLocal()` checks for `local`

Any other `app_env` string is still accepted by `load()`, but all five helpers return `false`.

## `Server` accessor contracts

`Server` exposes convenience methods with fixed precedence and normalization rules.

### Protocol detection

`protocol()` returns `https` when either of these is true:

- `HTTPS` is present and not equal to `off` after lowercasing
- `SERVER_PORT == 443`

Otherwise it returns `http`.

### Content type parsing

`contentType()` returns raw `CONTENT_TYPE` by default.

`contentType(true)` strips everything after the first `;`, so:

```text
application/json; charset=UTF-8
```

becomes:

```text
application/json
```

### AJAX detection

`ajax()` returns `true` only when `HTTP_X_REQUESTED_WITH`, after lowercasing, is exactly `xmlhttprequest`.

### IP precedence

`ip()` resolves the first non-null value in this order:

1. `HTTP_CLIENT_IP`
2. `HTTP_X_FORWARDED_FOR`
3. `REMOTE_ADDR`

This is a simple precedence check. The method does not parse forwarded IP lists and does not validate trusted proxies.

### Accepted language parsing

`acceptedLang()` takes the first comma-separated entry from `HTTP_ACCEPT_LANGUAGE`, trims it, then returns the first two lowercase characters.

Examples:

- `en-US,en;q=0.9` -> `en`
- `fr` -> `fr`

## Error contract

The package defines three local exception factories in `EnvException`:

- `environmentImmutable()`
- `environmentNotLoaded()`
- `invalidValue()`, raised by `getInt()` and `env_int()` for text that is not a whole number

It also calls `fileNotFound(...)`, inherited from the shared base exception layer, when the selected `.env` file is absent.
