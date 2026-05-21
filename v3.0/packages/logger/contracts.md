# Logger Contracts

The Logger package is small, but a few runtime contracts matter when you build on top of it.

## `Logger` is PSR-3-shaped, but not strict PSR-3 validation

`Quantum\Logger\Logger` implements `Psr\Log\LoggerInterface` and exposes the standard methods:

- `emergency()`
- `alert()`
- `critical()`
- `error()`
- `warning()`
- `notice()`
- `info()`
- `debug()`
- `log()`

But the package does not validate arbitrary custom level strings in `log()`.

Instead:

- threshold comparison falls back to the package's default `error` numeric value for unknown levels
- the original level string is still forwarded to the adapter

For predictable behavior, use the built-in PSR log levels only.

## Threshold changes are global, not per logger

`LoggerConfig` keeps the active threshold in static state.

That means the threshold is shared across all logger instances in the same process.

If one part of the app resolves a logger whose config level is `debug`, and another later resolves one whose config level is `error`, the later resolution updates the threshold used from then on.

## The `message` adapter has a hard environment gate

`LoggerFactory::resolve()` rejects `message` outside debug mode.

In debug mode, the opposite happens: the factory forces `message` even when you requested another adapter.

So adapter selection is environment-sensitive, not purely call-driven.

## File logging uses only one special context key

For file adapters, the only context key that changes output is:

- `trace`

It is appended verbatim after the formatted message.

No placeholder interpolation or structured context rendering happens.

## Debugger logging uses one routing key

For the `message` adapter, the special context key is:

- `tab`

It chooses the debugger store cell that receives the message.

If you omit it, the package uses the default messages tab.

## Adapter implementations must satisfy `ReportableInterface`

Custom adapters resolved through the factory must implement:

```php
public function report(string $level, string $message, ?array $context = []): void;
```

If the resolved adapter instance does not implement that contract, the factory throws an adapter-not-supported exception.

## Invalid configured thresholds fail soft

`LoggerConfig::setAppLogLevel()` only updates the threshold when the provided level exists in the internal map.

If the configured level is unknown, the previous threshold stays in place.

That means a bad config value does not raise an exception here; it leaves logging on the last valid threshold.