# Logger

The Logger package gives Quantum a small PSR-3-compatible logging layer with three delivery modes:

- write to one file
- write to a date-based daily file
- send messages to the DebugBar message store during debug mode

Use it when you want framework-level logging through `logger()` or the global level helpers, while keeping the output backend configurable.

## When to use it

Reach for Logger when you need to:

- record application errors or warnings to disk
- switch between a single log file and one file per day
- surface debug messages inside Quantum's debugger instead of writing files

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

In debug mode, the factory always resolves the `message` adapter instead. That means debug runs send logs to the debugger message store, not to file-based adapters.

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
- The package does not validate arbitrary custom level strings. Stick to the standard PSR log levels.