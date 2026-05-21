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

So Logger does not eagerly load configuration during bootstrap. The first logger access can trigger config import.

After that, the factory reads:

- `logging.default` for the default adapter name
- `logging.<adapter>.level` for the severity threshold
- `logging.<adapter>` for adapter-specific constructor parameters

## Debug-mode override

Debug mode changes the package behavior in two ways.

### Adapter selection is forced to `message`

When `is_debug_mode()` is true, the factory ignores the requested adapter and the configured default and resolves `message` instead.

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

`MessageAdapter` does not write files. It sends messages into the debugger store:

- default tab: `Debugger::MESSAGES`
- custom tab: `context['tab']`

If `debugbar()->isEnabled()` is false, the adapter drops the message silently.