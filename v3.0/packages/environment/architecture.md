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
Environment::load()
  -> require <base>/shared/config/env.php (EnvException if missing)
  -> read app_env from it
  -> choose .env or .env.<app_env> (EnvException if missing)
  -> Dotenv::createArrayBacked(...)->load()
  -> cache loaded values in $envContent
```

## How `Environment` is organised

`Environment` implements `EnvironmentInterface` and loads the `.env` file itself: it holds the state, `setMutable()`, `load()` and the private methods that pick and parse the file. Reading and writing each have their own trait in `Quantum\Environment\Traits`:

- `AppEnvTrait`: `getAppEnv()` and the `is...()` checks
- `ReadTrait`: the readers `getValue()`, `getBool()`, `getInt()`, `hasKey()` and `getRow()`
- `WriteTrait`: `updateRow()`. It needs the path and name of the file, so it declares `getEnvFilePath()` and `getEnvFileName()` abstract, and `Environment` provides them

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
2. finds the key and its current value as the file writes them: `KEY="value"` (also over several lines), `KEY='value'`, `KEY=value` up to a space or `#`, or `KEY` and `KEY=` without a value
3. replaces that part with `KEY=newValue`, so a comment after the value stays
4. writes the full file back

When the key does not exist, it appends a new `KEY=value` line. In both cases the new value is written as it is given, without quotes. A `$` or `\` in it stays as typed, but a space makes the file fail to load on the next request, and text after a `#` is read as a comment, so pass such values only after checking them.

The search starts from the value as the `.env` parser read it. When the file writes that value in another form, the line is not found, the file stays unchanged and only the cached value changes. That happens for `export KEY=value`, a space after `=`, an escape such as `\"` or `\n` inside double quotes, and `${VAR}`. If the replacement itself fails, `updateRow()` throws `EnvException::fileNotFound()` and does not write the file.

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
