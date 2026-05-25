# Cron Usage

## Define a task with the fluent scheduler

```php
<?php

return schedule('billing:expire-trials')
    ->dailyAt('01:30')
    ->call(function (): void {
        // expire trial accounts
    })
    ->build();
```

This is the most readable option when you are creating task files under your app cron directory.

## Define a task with a raw expression

```php
<?php

return cron_task('feeds:refresh', '*/15 * * * *', function (): void {
    // refresh feeds
});
```

Use this when you already have a cron expression from operations or existing infrastructure.

## Use array task definitions

`CronManager` also accepts array-returning task files:

```php
<?php

return [
    'name' => 'reports:weekly',
    'expression' => '0 7 * * 1',
    'callback' => function (): void {
        // create weekly report
    },
];
```

All three keys are required.

## Run all due tasks

```php
$stats = cron_manager()->runDueTasks();
```

Typical returned shape:

```php
[
    'total' => 3,
    'executed' => 1,
    'skipped' => 1,
    'failed' => 0,
    'locked' => 1,
]
```

`skipped` means the task was not due. `locked` means it was due, but another process already held the task lock.

## Run one task by name

```php
cron_manager()->runTaskByName('feeds:refresh');
```

Use this for manual execution, admin tooling, or debugging a single scheduled job.

## Bypass locks deliberately

```php
cron_manager()->runTaskByName('feeds:refresh', true);
```

Force mode runs the task without trying to acquire its lock. Use it carefully for recovery or manual intervention, because it can overlap with another live run.

## Long-running jobs and custom lock handling

If you manage locks yourself, you can work with `CronLock` directly:

```php
$lock = new \Quantum\Cron\CronLock('imports:sync');

if ($lock->acquire()) {
    try {
        // long-running work
        $lock->refresh();
    } finally {
        $lock->release();
    }
}
```

`refresh()` updates the stored timestamp so stale-lock cleanup does not treat the running job as abandoned.

## Caveats that affect real runs

- keep task names unique so `runTaskByName()` is predictable
- do not rely on callback exceptions bubbling out of `CronManager`; the manager logs and counts them instead
- if you want to adjust a schedule time with `at()`, call a schedule method first, then `at()`
- if you pass a custom task directory, make sure it exists before the manager loads tasks
