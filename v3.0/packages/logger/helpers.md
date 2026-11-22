# Logger Helpers

The package exposes one resolver helper and five convenience helpers.

## `logger()`

```php
function logger(?string $adapter = null): Logger
```

Use this when you want the full logger instance.

```php
$logger = logger();
$logger->error('Payment capture failed');
```

Pass an adapter name when you need a specific backend in normal runtime:

```php
$logger = logger(LoggerType::DAILY);
$logger->warning('Slow downstream response');
```

Remember that in the web app, debug mode overrides adapter selection to `message` ([Debug-mode override](architecture.md#debug-mode-override)).

## Level helpers

The package also provides these global helpers:

- `error(string $message, array $context = [])`
- `warning(string $message, array $context = [])`
- `notice(string $message, array $context = [])`
- `info(string $message, array $context = [])`
- `debug(string $message, array $context = [])`

Each helper resolves the default logger through `LoggerFactory::get()` and immediately calls the matching method.

Example:

```php
error('Order export failed', ['trace' => $exception->getTraceAsString()]);
```

## Helper caveats

A few limits are easy to miss:

- the convenience helpers do not let you choose an adapter
- there are no global helpers for `critical`, `alert`, or `emergency`
- the convenience helpers and `logger()` both take a string message and a context; structured data goes in the context
- every helper call goes back through the shared factory

Use `logger()` when you need the full PSR-3 surface or adapter selection.
