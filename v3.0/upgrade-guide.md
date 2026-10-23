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
