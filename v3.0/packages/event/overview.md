# Event

The Event package lets one part of an application react to something that happened in another part, without the two knowing about each other.

Say a user signs up. The code that creates the account should not also have to know about the welcome email, the audit log and the analytics call. With events, it announces `user.registered` once, and each of those reactions listens for it on its own:

```php
event()->dispatch('user.registered', ['user' => $user]);
```

The framework uses the same mechanism around each request and command: you can listen to `web.send.before`, `console.command.before` and similar events to run code at a fixed point of the run. See [Hooking into the running app](../app/architecture.md#hooking-into-the-running-app).

## Package shape

- `Quantum\Event\EventManager` stores listeners and dispatches events
- `Quantum\Event\Helpers\event.php` exposes the shared `event()` helper
- `Quantum\Event\Exceptions\EventException` reports an empty event name

## What to expect

- **Any name works.** Event names do not need to be declared anywhere; dispatching a name nobody listens to does nothing.
- **Listeners stay.** A listener runs on every dispatch of its event, not only the first.
- **In order, right away.** Listeners run synchronously, in the order they were registered, inside the `dispatch()` call.
- **One payload array.** Each listener receives the array passed to `dispatch()`, or an empty array.
- **Errors are not caught.** An exception thrown by a listener stops the dispatch and reaches the caller.

## What the package does not do

- no listener priorities or wildcard names
- no return values collected from listeners
- no way to remove a listener once registered
- no queued or asynchronous delivery

## What to read next

- [Usage](usage.md)
- [Helpers](helpers.md)
- [Architecture](architecture.md)
