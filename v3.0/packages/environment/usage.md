# Environment Usage

For most application code, use the helpers.

## Reading an environment value

```php
$appName = env('APP_NAME', 'Quantum');
$dbHost = env('DB_HOST', '127.0.0.1');
```

This works only after the shared `Environment` instance has been loaded during bootstrap.

## Inspecting the active environment

```php
$environment = environment();

if ($environment->isProduction()) {
    // production-only behavior
}
```

You can also read the raw environment name with `getAppEnv()`.

## Updating a loaded environment file

```php
$environment = environment();
$environment->setMutable(true);
$environment->updateRow('APP_NAME', 'Quantum 3');
```

Use this carefully:

- mutability is off by default
- the target file must already have been selected and loaded
- updates modify the real `.env` file under `App::getBaseDir()`

## Reading request metadata

```php
$server = server();

$method = $server->method();
$uri = $server->uri();
$contentType = $server->contentType(true);
$ip = get_user_ip();
```

## Reading normalized headers

```php
$headers = server()->getAllHeaders();
$requestId = $headers['x-request-id'] ?? null;
```

Remember that the keys are normalized to lowercase hyphenated names.

## Recommended usage patterns

- treat `Environment` as bootstrap-loaded configuration state, not as a reloadable store
- use `env()` for reads and keep direct `Environment` mutation limited to tooling or controlled setup flows
- use `server()` when you want one shared request metadata object instead of touching `$_SERVER` directly
- be careful with `Server::ip()` behind proxies because it prefers client-supplied forwarding headers
