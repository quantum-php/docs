# Upgrade Guide

This guide summarizes the changes to make when you upgrade a Quantum project. It has two parts: [3.0 to 3.1](#upgrading-from-30-to-31) and [2.x to 3.0](#upgrading-from-2x-to-30).

## Upgrading from 3.0 to 3.1

3.1 raises the PHP minimum, moves some dependencies to newer lines and reworks parts of the internals. Each section below says what changed, what to do about it, and where no action is needed.

### 1. Platform and dependencies

**PHP 8.1 or newer.** An application on PHP 8.0 stays on 3.0.x. Check `php -v`, the `php` constraint in your `composer.json` (`^8.1`) and the PHP versions your CI runs.

**Symfony 6.4.** `symfony/console`, `symfony/var-dumper` and `symfony/var-exporter` are on the `^6.4` line. Commands that extend `Quantum\Console\CliCommand` need no change. A class in your application that extends a Symfony class directly may need Symfony 6's stricter return types.

**`psr/log` 2 or 3.** The framework accepts both, so an application that uses `psr/log` 3 (for example through Monolog 3) can now install it. The nine PSR-3 methods of `Quantum\Logger\Logger` declare `string|Stringable $message`. A class that extends `Logger` and overrides them must declare the same type:

```php
use Stringable;

// before
public function info($message, array $context = []): void

// after
public function info(string|Stringable $message, array $context = []): void
```

**Return types.** `Quantum\HttpClient\ResponseHeaders` declares `offsetGet()`, `current()` and `key()` as `mixed`, and `Quantum\Session\Adapters\Database\DatabaseHandler::gc()` as `int|false`, because PHP 8.1 expects them. A subclass that overrides these methods must declare compatible return types. `gc()` also returns the number of deleted sessions now; it returned `0` after any successful delete.

**No action needed:** private properties that are only set in the constructor are `readonly` now, so subclasses are unaffected, and `ErrorHandler` registers closures instead of array callables. Only a test that reads the registered handler back from PHP sees the difference.

### 2. OpenAPI documentation is written as attributes

The `DefaultApi` and `DemoApi` module templates describe the API with PHP attributes (`#[OA\Get(...)]`) instead of `@OA\...` docblock annotations, and the framework no longer requires `doctrine/annotations`. Modules you generate from 3.1 on need nothing. See [OpenAPI resource generation](cli/code-generation.md#openapi-resource-generation) for what `install:openapi` produces.

An existing module still has `@OA` docblocks in `Controllers/OpenApi`. A `spec.json` that was already generated keeps being served. Generating a new one from those docblocks fails with `Required @OA\PathItem() not found`, because swagger-php reads docblock annotations only when `doctrine/annotations` is installed. Do one of these:

- convert the annotations to attributes, or
- keep them and run `composer require doctrine/annotations`.

Converting is mechanical. A nested annotation becomes a named argument of its parent, `{...}` becomes `[...]`, and `=` becomes `:`:

```php
// before
/**
 * @OA\Get(
 *     path="/api/status",
 *     summary="Get status",
 *     @OA\Response(response=200, description="Success")
 * )
 */
abstract public function status();

// after
use OpenApi\Attributes as OA;

#[OA\Get(
    path: '/api/status',
    summary: 'Get status',
    responses: [
        new OA\Response(response: 200, description: 'Success'),
    ]
)]
abstract public function status();
```

Several nested responses, parameters or properties go in one list (`responses: [...]`, `parameters: [...]`, `properties: [...]`). A single `@OA\JsonContent`, `@OA\Schema` or `@OA\RequestBody` is passed as one `new OA\...(...)` to `content`, `schema` or `requestBody`.

### 3. Deprecations are logged, not thrown

Quantum's error handler used to turn every reported PHP error into an `ErrorException`, deprecations too. On PHP 8.1 and newer, that meant a library calling a deprecated function could stop a request. Now a deprecation (`E_DEPRECATED` or `E_USER_DEPRECATED`) is logged as a warning, `<message> in <file>:<line>`, and the script goes on. Notices, warnings and other errors still throw.

You do not need to change anything, but check your log after the upgrade: deprecations from your own code and your dependencies show up there as warnings. A test that expects a deprecation to throw an `ErrorException` must be updated. The [Tracer contracts](packages/tracer/contracts.md#error-conversion-contract) describe the rule.

### 4. `Hook` is replaced by `Event`

If your code calls `hook()`, it needs three renames and a clean-up. The names changed, and so did a few rules:

```php
// before
hook()->on('user.registered', function ($args) {
    // ...
});
hook()->fire('user.registered', ['user' => $user]);

// after
event()->listen('user.registered', function (array $payload) {
    // ...
});
event()->dispatch('user.registered', ['user' => $user]);
```

- `hook()` is `event()`, `on()` is `listen()` and `fire()` is `dispatch()`. No aliases remain.
- Delete `shared/config/hooks.php`: event names no longer need to be registered, and the file is not read. Dispatching a name nobody listens to does nothing. An empty name throws `EventException`.
- A listener always receives one array, which is empty when `dispatch()` got no payload. A hook listener received `null` in that case.
- Listeners stay registered after `dispatch()` and run on every dispatch. A hook listener ran once and was removed. If a listener must run only once, guard it with a flag inside the listener.
- Register listeners in a `helpers/` file of the project or of a module, which loads early enough to catch the framework's own events. See [Event usage](packages/event/usage.md#where-to-register-listeners).
- The debugger constant `Debugger::HOOKS` is `Debugger::EVENTS`, the debugbar tab is `events` and lists only events that have listeners, and the unused `hooks_dir()` helper is gone.

### 5. `Quantum\Loader` is removed

`Setup` moved to the config package, and the loading itself moved to the packages that own it. The constructor of `Setup` is unchanged, so for most code the upgrade is one import:

```php
// before
use Quantum\Loader\Setup;

// after
use Quantum\Config\Setup;

config()->import(new Setup('config', 'payments'));
```

- A required config file that is missing throws `ConfigException` (there is no `LoaderException` any more). To load a file only when it exists, use `config()->importIfExists(new Setup(...))`, which returns `false` for a missing file.
- Config paths resolve from the application base directory, not from the working directory of the process, so a command run from another folder finds the same files.
- `Environment::load()` takes no argument. It reads `shared/config/env.php` and the matching `.env` file, and reports a missing file with `EnvException`. Remove a `new Setup(...)` argument if you call it yourself.
- No action needed for the helper files: the boot loads the component, app and module helpers directly.

See the [Config package](packages/config/overview.md) for the loading rules.

## Upgrading from 2.x to 3.0

This part summarizes the required changes when upgrading Quantum projects from 2.x to 3.0.

### 1. Platform Requirements

- Minimum PHP version is now `8.0`.
- PHP `7.4` and older are no longer supported.

If you are upgrading an early 3.0 project, re-check your runtime before troubleshooting application code. The current framework and starter project both target the PHP 8 runtime line.

### 1.1 Notes For 3.0.3

If you are already on an earlier `3.0.x` release and moving to `3.0.3`, the main upgrade checks are:

- verify the runtime is on PHP 8
- verify any Twig-based rendering setup still matches your installed Twig package, because Twig is now treated as an optional renderer dependency
- re-check local and CI environments if they were previously pinned around the older PHP 7.4 baseline

### 2. Route and Middleware Response Contract

3.0 enforces explicit `Quantum\Http\Response` returns.

- Route handlers must return `Response`.
- Middleware `apply()` must return `Response`.
- `redirect()` and `redirectWith()` now return `Response` and should be returned by caller.

Before:

```php
$route->get('home', function ($response) {
    $response->html('ok');
});
```

After:

```php
$route->get('home', function (): Quantum\Http\Response {
    return response()->html('ok');
});
```

### 3. Request and Response Access

`Request` and `Response` are now instance-based in runtime flow.

- Use `request()` and `response()` helpers.
- Remove assumptions based on static facade behavior.

### 4. Dependency Injection Is Stricter

- `Di::get()` no longer auto-registers dependencies.
- Dependencies must be explicitly registered before retrieval.

Typical pattern:

```php
if (!Di::isRegistered(SomeService::class)) {
    Di::register(SomeService::class);
}

$service = Di::get(SomeService::class);
```

### 5. Renamed Base Classes

Update references:

- `Quantum\Service\QtService` -> `Quantum\Service\Service`
- `Quantum\Middleware\QtMiddleware` -> `Quantum\Middleware\Middleware`
- `Quantum\Migration\QtMigration` -> `Quantum\Migration\Migration`
- `Quantum\Console\QtCommand` -> `Quantum\Console\CliCommand`

### 6. Environment API Changes

- `Environment` is no longer a static singleton.
- Use `environment()` helper and methods like `isProduction()`, `isTesting()`, `isStaging()`, `isDevelopment()`, `isLocal()`.

### 7. Model and DB Behavior Updates

- `DbModel` fetch methods now return new model instances instead of mutating current model.
- `create()` resets model state before insert flows.
- DB-generated primary keys are synced back after save.

### 8. Router and Execution Changes

- Middleware ordering is prepend-based (later middleware wraps earlier).
- Route name uniqueness is validated at build time.
- Legacy implicit controller resolution paths were removed.

### 9. Upgrade Verification Checklist

After code changes, run:

```bash
vendor/bin/phpunit
composer phpstan
composer cs:check
```

Then smoke-test:

- Authentication routes
- Redirect/error flows
- Middleware validation branches
- Pagination and model fetch flows
