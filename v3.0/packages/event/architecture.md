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

- The app pipeline dispatches the runtime stage events, such as `web.preflight.before` and `console.command.before`; the boot dispatches none. The full list and the order they fire in are on [App Contracts](../app/contracts.md#lifecycle-events).
- The debug toolbar reads `getRegistered()` into its `events` tab when it renders; see [Debugger Architecture](../debugger/architecture.md#where-each-tabs-data-comes-from).

Everything else is up to your application.
