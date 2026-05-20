# Hook Usage

## Queue a listener and fire it once

```php
hook()->on('user.registered', function (?array $args): void {
    $userId = $args['user_id'] ?? null;

    // react to the event
});

hook()->fire('user.registered', [
    'user_id' => 42,
]);
```

`fire()` passes the full argument array as a single parameter to the listener.

## The same hook is empty after firing

Listeners are removed as they are executed.

```php
hook()->on('user.registered', function (?array $args): void {
    // runs once
});

hook()->fire('user.registered');
hook()->fire('user.registered'); // no queued listeners remain
```

If you need the listener again, queue it again with `on()`.

## Unregistered hook names fail

Both `on()` and `fire()` require a hook name that was registered during manager construction.

```php
hook()->on('missing-hook', function (?array $args): void {
    // never reached
});
```

This raises `HookException` because the name does not exist in the internal registry.

## Listener signature expectations

Every listener is invoked as `$fn($args)`.

That means the safest listener shape is a callable that accepts one parameter, usually `?array $args`.

A zero-argument listener is not compatible with how `fire()` invokes callables.

## Inspect current manager state

```php
$hooks = hook()->getRegistered();
```

The returned array includes:

- every registered hook name
- the currently queued listeners for each hook

This is useful for debugging whether a hook exists and whether listeners are still waiting to run.
