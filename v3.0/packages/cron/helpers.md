# Cron Helpers

## `cron_manager()`

Create a new `CronManager` instance.

```php
$manager = cron_manager();
$stats = $manager->runDueTasks();
```

Pass a directory if your task files do not live in the default app `cron` folder:

```php
$manager = cron_manager(base_dir() . '/modules/Billing/cron');
```

This helper does not return a shared singleton. Each call creates a fresh manager.

## `cron_task()`

Create a `CronTask` directly from a name, expression, and callback.

```php
return cron_task('feeds:refresh', '*/15 * * * *', function (): void {
    // refresh feeds
});
```

Use this when you already know the exact cron expression you want.

## `schedule()`

Start a fluent schedule definition.

```php
return schedule('feeds:refresh')
    ->everyFifteenMinutes()
    ->call(function (): void {
        // refresh feeds
    })
    ->build();
```

Use this when readability matters more than writing the expression manually.

## `cron_config()`

Read cron package configuration values.

```php
$lockPath = cron_config('lock_path');
$maxLockAge = cron_config('max_lock_age', 86400);
```

On first use, the helper tries to import `config/cron` if that config entry has not already been loaded. If the file is missing, the helper silently falls back to defaults and the provided fallback value.
