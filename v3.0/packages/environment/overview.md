# Environment

The Environment package loads `.env` files into an in-memory store and exposes two small runtime APIs:

- `Environment` for loading and reading environment values
- `Server` for reading a captured copy of `$_SERVER`

In normal application code, the main entry points are the `env()` and `server()` helpers.

## Package shape

The package is built from these parts:

- `Quantum\Environment\Environment` selects and loads one `.env` file
- `Quantum\Environment\Server` wraps a snapshot of `$_SERVER`
- `Quantum\Environment\Helpers\env.php` exposes `environment()` and `env()`
- `Quantum\Environment\Helpers\server.php` exposes `server()`, `get_user_ip()`, and a `getallheaders()` fallback
- `Quantum\Environment\Enums\Env` defines the built-in environment names
- `Quantum\Environment\Exceptions\EnvException` raises package-specific runtime errors

## Supported environment names

`Quantum\Environment\Enums\Env` ships five string constants:

- `Env::PRODUCTION`
- `Env::STAGING`
- `Env::DEVELOPMENT`
- `Env::TESTING`
- `Env::LOCAL`

These constants are convenience values. `Environment::load()` still accepts any `app_env` string and uses it directly when building the file name.

## What the package is good for

### Environment file loading

`Environment` reads one file from `App::getBaseDir()`:

- production -> `.env`
- any other `app_env` value -> `.env.<app_env>`

Loaded values are stored on the `Environment` instance in `$envContent`. Reads after that come from memory, not by re-reading the file.

### Request metadata access

`Server` gives the framework one shared object for request metadata such as URI, method, protocol, host, headers, and client IP.

The object copies `$_SERVER` in its constructor, so it works as a snapshot, not a live view.

## Important runtime constraints

- `Environment::load()` is one-shot; after the first successful load, later calls return immediately
- `env()` fails until the environment has been loaded
- missing `.env` files raise an exception instead of returning an empty store
- `updateRow()` is disabled unless `setMutable(true)` has been called first
- `Server` reads from its internal array only; later changes to global `$_SERVER` are not reflected unless the shared instance is rebuilt or mutated through `set()`
- `Server::ip()` trusts forwarded headers before `REMOTE_ADDR`
