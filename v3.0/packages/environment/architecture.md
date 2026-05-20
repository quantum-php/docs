# Environment Architecture

The package has two separate runtime models: one for `.env` loading and one for server metadata access.

## Environment loading flow

A typical environment read follows this path:

```text
env()
  -> environment()
  -> Di-managed Environment instance
  -> Environment::getValue($key, $default)
```

Before reads work, the shared `Environment` instance must be initialized:

```text
Environment::load(Setup $setup)
  -> ensure Loader is registered in DI
  -> Di::get(Loader::class)->setup($setup)->load()
  -> read app_env from loaded config
  -> choose .env or .env.<app_env>
  -> Dotenv::createArrayBacked(...)->load()
  -> cache loaded values in $envContent
```

## `Environment` lifecycle

`Environment` keeps three pieces of state that matter:

- `$loaded` prevents reloading after the first successful load
- `$envContent` stores the loaded key/value map
- `$appEnv` stores the selected environment name

Practical effect:

- one process can load at most one environment file per shared `Environment` instance
- changing the setup or changing the file on disk has no effect after load unless the instance is replaced
- `getAppEnv()` and the `isProduction()` / `isStaging()` / `isDevelopment()` / `isTesting()` / `isLocal()` helpers all read that cached `$appEnv` value

## File selection model

`Environment::load()` defaults to production when `app_env` is missing from the loaded config.

Selection logic is literal:

- `production` -> `.env`
- anything else -> `.env.<value>`

There is no validation that `app_env` matches one of the `Env` constants.

## Mutation model

`updateRow()` modifies both the file on disk and the in-memory `$envContent` cache.

When the key already exists, the method:

1. reads the whole environment file
2. replaces the exact `KEY=currentValue` line with `KEY=newValue`
3. writes the full file back

When the key does not exist, it appends a new `KEY=value` line.

Because the replacement pattern is built from the current cached value, the method is designed for values that still match the file content exactly.

## `Server` lifecycle

`server()` resolves `Server` through DI. The object copies `$_SERVER` once in `__construct()` and then serves all reads from its private `$server` property.

That makes `Server` a mutable snapshot object:

- `set()` mutates only the internal copy
- `flush()` empties only the internal copy
- `all()`, `get()`, and the convenience accessors read only the internal copy

## Header normalization flow

`Server::getAllHeaders()` scans the stored server array and includes only keys that begin with `HTTP_`.

For each header key it:

1. removes the `HTTP_` prefix
2. converts underscores to hyphens
3. lowercases the result

So `HTTP_X_REQUEST_ID` becomes `x-request-id`.

Keys such as `CONTENT_TYPE` are not included by this method because they do not start with `HTTP_`.
