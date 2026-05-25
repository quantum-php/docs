# Cron Contracts

## Task file contract

A cron task file must return one of these values:

```php
return cron_task('cleanup', '0 3 * * *', function (): void {
    // ...
});
```

or:

```php
return [
    'name' => 'cleanup',
    'expression' => '0 3 * * *',
    'callback' => function (): void {
        // ...
    },
];
```

If the returned value is neither a `CronTaskInterface` nor a valid array definition, task loading fails with `CronException`.

## `CronTask` contract

`CronTask` requires three inputs:

- `name`
- cron expression string
- callable callback

The constructor validates the expression immediately. Invalid expressions throw `CronException` before the task can be scheduled or run.

`handle()` calls the callback with no arguments, so the safest callback shape is a zero-argument callable.

## `CronTaskInterface`

Custom task objects must implement:

- `getExpression(): string`
- `getName(): string`
- `shouldRun(): bool`
- `handle(): void`

That means you can plug in your own due-check logic if you do not want to use `CronTask`.

## `Schedule` contract

A fluent schedule is not runnable until both of these are set:

- a schedule expression
- a callback through `call()`

`build()` throws `CronException` when either one is missing.

`at()` only makes sense after a method that already creates a full cron expression, such as `daily()` or `weekdays()`. If you call `at()` before any schedule method, the resulting expression is incomplete and task creation will fail later when `build()` validates it.

Time-based helpers like `dailyAt('06:30')`, `weeklyOn(1, '09:15')`, and `monthlyOn(10, '04:00')` expect `HH:MM` input.

## Locking contract

`CronLock` treats lock ownership as instance-local:

- `refresh()` works only after the current lock object acquired the lock
- `getTimestamp()` reads from the currently open handle and returns `0` when this lock object has no open handle
- `release()` is effectively a no-op success when the current object does not own a lock

Stale cleanup removes lock files only when they can be exclusively opened and their stored timestamp is older than `max_lock_age`.

## Runtime result contract

`runDueTasks()` always returns a stats array with these keys:

- `total`
- `executed`
- `skipped`
- `failed`
- `locked`

A task that is due but already locked increments `locked`, not `skipped`.

A task callback exception increments `failed` and is logged, but the exception is not re-thrown by the manager.

## Name lookup contract

`runTaskByName()` looks up tasks by the exact task name returned from `getName()`.

If no loaded task matches that name, it throws `CronException`.
