# Environment Management

The Quantum PHP Framework uses an environment-based configuration system to manage settings for different stages of the application lifecycle (e.g., development, production, testing).

## File Selection

The framework selects the environment file based on the `app_env` setting, which is determined during the initial loading phase.

- **Production**: Uses `.env`.
- **Other environments**: Uses `.env.{app_env}` (e.g., `.env.development`, `.env.staging`).

## Lifecycle and Loading

The `Environment` service implements a "one-shot" loading pattern.

### `load()`

- **One-shot**: Once the environment is loaded, subsequent calls to `load()` are no-ops. 
- **Initialization**: It reads `app_env` from `shared/config/env.php`, picks the matching `.env` file, validates that both files exist (`EnvException` otherwise), loads the variables, and marks the environment as loaded.
- The boot does this for you; you call it yourself only in custom bootstraps or tests.

### `env(string $key, $default = null)`

This helper function provides access to environment variables.

- **Contract**: You must call `load()` before accessing any variables via `env()`. If the environment has not been loaded yet, calling `env()` will throw an `EnvException`.

> **Warning**: In long-lived processes (like workers, daemons, or some test suites), be aware that once `load()` is executed, the environment state is fixed. Reloading variables requires the process or the service state to be reset.

## Server Accessor Contract

The `Server` class provides a controlled gateway to the server state.

### Metadata Accessor Details

| Method | Behavior Contract |
| :--- | :--- |
| `protocol()` | Returns `https` if `HTTPS` is truthy/not `off` OR `SERVER_PORT` is `443`; defaults to `http`. |
| `contentType(true)` | Returns `CONTENT_TYPE` but strips all characters after the first `;` (e.g., `application/json; charset=UTF-8` becomes `application/json`). |
| `getAllHeaders()` | Normalizes `HTTP_*` keys by removing the prefix, converting underscores to hyphens, and forcing lowercase. |
| `acceptedLang()` | Extracts the first language from `HTTP_ACCEPT_LANGUAGE` and returns only the first two characters in lowercase. |
| `ip()` | Precedence: `HTTP_CLIENT_IP` -> `HTTP_X_FORWARDED_FOR` -> `REMOTE_ADDR`. |

> **Proxy/Security Caveat**: The `ip()` method trusts headers provided by the client (proxies/load balancers). In production environments, ensure your entry point configures the application to support only trusted proxies.


```php
use Quantum\Environment\Environment;
use Quantum\Di\Di;

$env = new Environment();
$env->load();

Di::set(Environment::class, $env);

// Access a variable
$dbHost = env('DB_HOST', 'localhost');
```

## What to read next

After environment loading behavior, continue with:

- [Configuration](configuration.md)
- [Request Lifecycle](request-lifecycle.md)
- [Modules](../core-concepts/modules.md)
