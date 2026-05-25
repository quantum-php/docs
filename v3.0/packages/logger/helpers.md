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

Remember that debug mode overrides adapter selection to `message`.

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
- the convenience helpers accept string messages, while `logger()` also lets you send array payloads through the PSR-3 methods
- every helper call goes back through the shared factory
- in debug mode, helper output goes to the debugger message store instead of files

Use `logger()` when you need the full PSR-3 surface, adapter selection, or structured array messages.