# Cron

Cron gives you a file-based task runner for scheduled jobs inside a Quantum application.

Use it when you want to define application tasks as PHP files, check whether they are due, and prevent the same task from running twice at the same time.

## What the package provides

- `Quantum\Cron\CronManager` to discover and run tasks
- `Quantum\Cron\CronTask` for explicit task objects
- `Quantum\Cron\Schedule` for fluent schedule creation
- `Quantum\Cron\CronLock` for file-based concurrency protection
- helpers: `cron_manager()`, `cron_task()`, `schedule()`, and `cron_config()`

## Quick example

Create a task file in your app cron directory:

```php
<?php

return schedule('reports:daily')
    ->dailyAt('06:30')
    ->call(function (): void {
        // send reports
    })
    ->build();
```

Run due tasks:

```php
$stats = cron_manager()->runDueTasks();
```

## How task loading works

By default, `CronManager` looks for `*.php` files in `base_dir()/cron`.

Each file must return one of these:

- a `CronTaskInterface` implementation
- an array with `name`, `expression`, and `callback`

If the default `cron` directory does not exist, the manager quietly treats that as "no tasks". If you pass a custom directory and it does not exist, the manager throws `CronException`.

## Important behavior

- task names are the lookup key; if multiple files return the same name, the later loaded task replaces the earlier one
- `runDueTasks()` catches task callback failures, logs them, increments `failed`, and continues with other due tasks
- `runTaskByName()` also uses the same internal runner, so task callback failures are logged instead of re-thrown
- locks are skipped only when you run in force mode
- `cron_manager()` returns a new manager each time; stats are not shared across helper calls

## Configuration defaults

`cron_config()` lazily loads `config/cron` once per process if it is available.

The package has working defaults even when that config file is missing:

- task directory: `base_dir()/cron`
- lock directory: `base_dir()/runtime/cron/locks`
- maximum lock age: `86400` seconds

## Read next

- [Architecture](architecture.md)
- [Contracts](contracts.md)
- [Helpers](helpers.md)
- [Usage](usage.md)
