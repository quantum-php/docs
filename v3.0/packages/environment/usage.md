# Environment Usage

For most application code, use the helpers.

## Reading an environment value

```php
$appName = env('APP_NAME', 'Quantum');
$dbHost = env('DB_HOST', '127.0.0.1');
```

This works only after the shared `Environment` instance has been loaded during bootstrap.

## Reading booleans and numbers

Every value in a `.env` file is text. `DEBUG=false` is the string `'false'`, which PHP treats as true, and `MAIL_PORT=587` is the string `'587'`, which a function with an `int` parameter rejects under `strict_types`. Convert the text once, where you read it:

```php
$debug = env_bool('DEBUG');
$port = env_int('MAIL_PORT', 25);
```

`env_bool()` returns `true` for `true`, `1`, `on` and `yes`, in any letter case, and `false` for everything else, including an empty value. `env_int()` returns the number, and throws an `EnvException` when the text is not a whole number, so a typo in `.env` shows up at once instead of silently becoming `0`. When the key is missing, both return the default: `false` and `0` unless you pass another. `env()` keeps returning the raw text.

The same readers are methods of the shared instance, `environment()->getBool('DEBUG')` and `environment()->getInt('MAIL_PORT')`. Like `env()`, they work only after the environment has been loaded. They are available since 3.1.2; the exact rules are on the [contracts page](contracts.md#typed-reader-contract).

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
