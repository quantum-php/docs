# Logger Architecture

The Logger package follows a short resolution pipeline:

1. resolve a logger through `LoggerFactory`
2. load logging config on first use when needed
3. set the process-wide severity threshold in `LoggerConfig`
4. reuse or create the adapter-specific `Logger`
5. forward log calls to the adapter when the threshold check passes

## Factory lifecycle

`LoggerFactory::get()` registers the factory in DI on first use and then resolves it from the container.

That gives the package a shared factory instance for the life of the container. The factory keeps an in-memory cache:

```php
private array $instances = [];
```

The practical effect is simple:

- the first call for an adapter builds the logger
- later calls for the same adapter reuse the same `Logger` object

## Config loading behavior

`LoggerFactory::resolve()` imports the `logging` config only when `config()->has('logging')` is false.

In practice that first access happens during boot: both the web and the console boot resolve a logger for the error handler (`SetupErrorHandlerStage`), so the config is loaded by the time application code runs.

After that, the factory reads:

- `logging.default` for the default adapter name
- `logging.<adapter>.level` for the severity threshold
- `logging.<adapter>` for adapter-specific constructor parameters
- `logging.message.limit` for the number of messages the `message` adapter keeps

## Debug-mode override

Debug mode changes the package behavior in two ways.

### The web app logs to `message`

While you work on a page in debug mode, you want its log lines in the debug toolbar, not in a file you have to open. So when `is_debug_mode()` is true and the running app is the web app (`is_web_app()`), the factory ignores the requested adapter and the configured default and resolves `message` instead.

A console command in debug mode has no toolbar to show its messages, so it keeps the requested adapter or the configured default and writes to the log file:

```php
// inside a console command, in debug mode
info('Import finished'); // written by the default adapter, for example `single` to logs/app.log
```

Asking for `message` explicitly with `logger(LoggerType::MESSAGE)` still works in the console in debug mode.

### Threshold filtering is bypassed

In debug mode, Logger reports every message regardless of the configured threshold.

So debug mode is not just a different backend. It is also a different filtering policy.

## Shared threshold state

`LoggerConfig` stores the active threshold in a static property.

That means each `LoggerFactory::resolve()` call can update the process-wide threshold before returning a logger. If you resolve different adapters with different configured levels, the most recently resolved one sets the threshold used by later `Logger::log()` calls.

This matters because the threshold is not stored per logger instance.

## Message formatting pipeline

File adapters use a shared formatter that:

1. prepends a timestamp and capitalized level
2. JSON-encodes array messages
3. appends `context['trace']` when present
4. appends the final string to the target file

All other context keys are ignored by file adapters.

## Message adapter flow

`MessageAdapter` appends each reported message to its in-memory list. It does not know about the debugger: the debug toolbar reads the list through `logger()` when it renders. See [the `message` adapter](adapters.md#message).