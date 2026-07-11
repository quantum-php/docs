# Upgrade Guide: 2.x to 3.0

This guide summarizes required changes when upgrading Quantum projects from 2.x to 3.0.

## 1. Platform Requirements

- Minimum PHP version is now `8.0`.
- PHP `7.4` and older are no longer supported.

If you are upgrading an early 3.0 project, re-check your runtime before troubleshooting application code. The current framework and starter project both target the PHP 8 runtime line.

## 1.1 Notes For 3.0.3

If you are already on an earlier `3.0.x` release and moving to `3.0.3`, the main upgrade checks are:

- verify the runtime is on PHP 8
- verify any Twig-based rendering setup still matches your installed Twig package, because Twig is now treated as an optional renderer dependency
- re-check local and CI environments if they were previously pinned around the older PHP 7.4 baseline

## 2. Route and Middleware Response Contract

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

## 3. Request and Response Access

`Request` and `Response` are now instance-based in runtime flow.

- Use `request()` and `response()` helpers.
- Remove assumptions based on static facade behavior.

## 4. Dependency Injection Is Stricter

- `Di::get()` no longer auto-registers dependencies.
- Dependencies must be explicitly registered before retrieval.

Typical pattern:

```php
if (!Di::isRegistered(SomeService::class)) {
    Di::register(SomeService::class);
}

$service = Di::get(SomeService::class);
```

## 5. Renamed Base Classes

Update references:

- `Quantum\Service\QtService` -> `Quantum\Service\Service`
- `Quantum\Middleware\QtMiddleware` -> `Quantum\Middleware\Middleware`
- `Quantum\Migration\QtMigration` -> `Quantum\Migration\Migration`
- `Quantum\Console\QtCommand` -> `Quantum\Console\CliCommand`

## 6. Environment API Changes

- `Environment` is no longer a static singleton.
- Use `environment()` helper and methods like `isProduction()`, `isTesting()`, `isStaging()`, `isDevelopment()`, `isLocal()`.

## 7. Model and DB Behavior Updates

- `DbModel` fetch methods now return new model instances instead of mutating current model.
- `create()` resets model state before insert flows.
- DB-generated primary keys are synced back after save.

## 8. Router and Execution Changes

- Middleware ordering is prepend-based (later middleware wraps earlier).
- Route name uniqueness is validated at build time.
- Legacy implicit controller resolution paths were removed.

## 9. Upgrade Verification Checklist

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
