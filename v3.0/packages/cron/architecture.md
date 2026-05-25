# Cron Architecture

## Main pieces

The package has four public building blocks:

- `CronManager` loads task files and runs matching tasks
- `CronTask` wraps a task name, a cron expression, and a callback
- `Schedule` builds `CronTask` instances with a fluent API
- `CronLock` uses lock files plus `flock()` to prevent overlapping runs

## Task discovery

`CronManager` resolves its task directory in this order:

1. constructor argument
2. `cron_config('path')`
3. `base_dir()/cron`

`loadTasks()` scans that directory for `*.php` files and requires each file.

Each required file must return either:

- a ready-made `CronTaskInterface` object, or
- an array definition with `name`, `expression`, and `callback`

Array definitions are converted into `CronTask` objects before execution.

## Due-check and execution flow

`runDueTasks()` loads tasks, asks each task `shouldRun()`, and sends due tasks through the same runner used by `runTaskByName()`.

The manager keeps execution counters in one stats array:

- `total`
- `executed`
- `skipped`
- `failed`
- `locked`

Those counters live on the manager instance. If you reuse the same instance for multiple runs, stats accumulate instead of resetting.

## Lock lifecycle

Each task run creates a `CronLock` keyed by the task name.

Lock files live under the configured lock directory and use a sanitized version of the task name. Empty or fully sanitized-away names fall back to `default`.

Lock behavior is:

- constructor ensures the lock directory exists
- constructor also cleans up stale `*.lock` files older than `max_lock_age`
- `acquire()` creates or opens the task lock file and tries a non-blocking exclusive lock
- a successful lock writes the current Unix timestamp into the file
- `release()` unlocks, closes, and removes the lock file

`isLocked()` is a read-style probe. It checks whether another process currently holds the lock, but it does not delete files on its own.

## Force mode

When you run `runDueTasks(true)` or `runTaskByName($name, true)`, the manager skips lock acquisition entirely.

That also means the `finally` block does not release a lock for that run. Force mode is meant to bypass the lock system, not refresh or clean it up.

## Logging behavior

The manager logs start, skip, success, and failure events through `LoggerFactory::get(LoggerType::SINGLE)`.

If the logger cannot be resolved, the package falls back to `error_log()`.

## Failure boundaries

There are two different failure layers:

- task-definition and setup failures throw `CronException`
- task callback failures are caught inside the manager, counted, and logged

That split matters in production: a broken task file stops the run setup, while a failing due task does not stop other due tasks from being processed.
