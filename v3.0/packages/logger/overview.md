# Logger

The Logger package gives Quantum a small PSR-3-compatible logging layer with three delivery modes:

- write to one file
- write to a date-based daily file
- keep messages in memory while the web app runs in debug mode, for the debug toolbar

Use it when you want framework-level logging through `logger()` or the global level helpers, while keeping the output backend configurable.

## When to use it

Reach for Logger when you need to:

- record application errors or warnings to disk
- switch between a single log file and one file per day
- see the messages of a request in the debug toolbar instead of in files

If you only need a raw filesystem append, use Storage directly. Logger is useful when you want severity filtering and adapter selection.

## Package shape

The package is built from a few small parts:

- `Quantum\Logger\Logger` is the PSR-3 logger users call
- `Quantum\Logger\Factories\LoggerFactory` resolves and caches logger instances by adapter name
- adapters implement `Quantum\Logger\Contracts\ReportableInterface`
- `Quantum\Logger\LoggerConfig` holds the active severity threshold map
- helper functions expose the common entry points globally

## Adapter model

Logger supports these adapter names:

- `single`
- `daily`
- `message`

In normal runtime, the factory uses the requested adapter or the configured default.

In debug mode, the web app resolves the [`message` adapter](adapters.md#message) instead, so its messages go to the debug toolbar ([Debug-mode override](architecture.md#debug-mode-override)).

## Severity filtering

The package compares levels with this built-in order:

- `debug` = 100
- `info` = 200
- `notice` = 250
- `warning` = 300
- `error` = 400
- `critical` = 500
- `alert` = 550
- `emergency` = 600

The default threshold is `error`.

Outside debug mode, a message is reported only when its severity is greater than or equal to the current application threshold.

In debug mode, `Logger::log()` bypasses threshold filtering and reports every call.

## Important constraints

- The active log threshold is stored in static `LoggerConfig` state, so resolving a logger updates process-wide logging behavior.
- `LoggerFactory` caches one `Logger` instance per adapter name inside the factory service.
- The `message` adapter is not available outside debug mode.
- File adapters only use the `trace` context key for output formatting. Other context values are ignored by file logging.
- The package does not validate arbitrary custom level strings. Stick to standard PSR log levels for predictable filtering and output.
- The `daily` adapter picks its `<YYYY-MM-DD>.log` file when the adapter is created. In long-running workers, recreate/re-resolve the logger after midnight if you need strict daily rollover.