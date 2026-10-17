# Event Architecture

The package is one class, `Quantum\Event\EventManager`, shared through DI by the `event()` helper.

## Listener store

The manager keeps one map from event name to listeners:

```php
array<string, array<int, callable>>
```

`listen(string $name, callable $listener): void` appends the listener to its name. There is no deduplication: registering the same callable twice makes it run twice.

## Dispatch

`dispatch(string $name, array $payload = []): void` calls each listener of that name with the payload, in registration order, and returns nothing. Listeners are not removed, and a name without listeners is a no-op.

Both methods reject an empty name with `EventException::emptyEventName()` (`The event name must not be empty.`).

`getRegistered()` returns the whole map.

## Who dispatches inside the framework

- The app pipeline dispatches the boot stage events, such as `boot.modules.before` and `boot.modules.after`. The full list and the rules are on [App Contracts](../app/contracts.md#stage-and-pipeline-contract).
- When the debug bar is enabled, a matched web request writes `getRegistered()` to the debug bar's `events` tab; see [Debugger Architecture](../debugger/architecture.md).

Everything else is up to your application.
