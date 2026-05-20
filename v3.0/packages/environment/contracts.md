# Environment Contracts

The Environment package has no interface layer, but it does have a few strong code-level contracts.

## Load-before-read contract

`Environment::getValue()` throws `EnvException::environmentNotLoaded()` until `load()` has completed.

That means this is invalid:

```php
$value = env('APP_NAME');
```

unless the application bootstrap has already loaded the environment.

`hasKey()` and `getRow()` do not enforce the same guard. They read directly from the internal cache and simply behave as if the store is empty before load.

## One-shot load contract

`Environment::load()` returns immediately when `$loaded` is already `true`.

This is not a reload API. It is a first-load-only initializer.

## File existence contract

After choosing the target file name, `Environment::load()` checks `file_exists(...)` on `App::getBaseDir() . DS . $envFile`.

If the file is missing, it throws `EnvException::fileNotFound($this->envFile)`.

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

The package defines two local exception factories in `EnvException`:

- `environmentImmutable()`
- `environmentNotLoaded()`

It also calls `fileNotFound(...)`, inherited from the shared base exception layer, when the selected `.env` file is absent.
