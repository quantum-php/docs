# Logger Usage

## Log to the configured default backend

For most application code, use the helper or resolve the default logger:

```php
error('Payment gateway timeout');

logger()->warning('Retrying webhook delivery');
```

Outside debug mode, these calls write only when the configured threshold allows them.

## Choose a file adapter explicitly

When you want to force one of the file backends in normal runtime, request it by name:

```php
use Quantum\Logger\Enums\LoggerType;

$dailyLogger = logger(LoggerType::DAILY);
$dailyLogger->error('Nightly sync failed');
```

This is useful when your config defines multiple logging backends and you want one intentionally.

## Send a stack trace to a file log

File adapters treat `trace` as a special context value:

```php
try {
    // ...
} catch (Throwable $exception) {
    logger()->error('Import job ended early', [
        'trace' => $exception->getTraceAsString(),
    ]);
}
```

That writes the formatted message first and then appends the trace block.

## Log a structured payload

When you want file logs to capture structured data, call the logger instance directly:

```php
logger()->info([
    'job' => 'catalog-sync',
    'status' => 'queued',
    'items' => 48,
]);
```

File adapters JSON-format array messages before writing them. The global level helpers accept string messages, so `logger()` is the better fit for this style.

## Check what was logged in debug mode

In debug mode the web app keeps the messages in memory, so a test or a debug page can read them back from the [`message` adapter](adapters.md#message):

```php
info('Import started');

$messages = logger()->getAdapter()->getMessages();
// [['info' => 'Import started']]
```

## Pick the right backend

### Use `single` when:

- you want one stable file such as `storage/logs/app.log`
- external tooling already tails or rotates one known file

### Use `daily` when:

- you want one log file per day
- you prefer date-based separation without external naming logic

### Rely on debug-mode `message` when:

- you are troubleshooting a page locally
- you want its logs in the debug toolbar instead of on disk

## Practical caveats

- `logger(LoggerType::MESSAGE)` is valid only in debug mode.
- In the web app, `logger(LoggerType::DAILY)` or `logger(LoggerType::SINGLE)` still resolves to `message` in debug mode.
- Reusing a resolved logger reuses the adapter instance behind it.
- Calling `log()` with a non-standard level string is not rejected by the package, but it can produce uneven behavior. Prefer the standard level methods instead.