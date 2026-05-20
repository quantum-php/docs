# Hook

The Hook package provides a small in-process event queue.

It lets code register named hooks, attach listeners to those hooks, and fire each hook later with one optional argument array.

In normal application code, the main entry points are `Quantum\Hook\HookManager` and the global `hook()` helper.

## Package shape

The package contains four source pieces:

- `Quantum\Hook\HookManager` loads configured hook names, stores listeners, and fires hooks
- `Quantum\Hook\Helpers\hook.php` exposes the shared `hook()` helper
- `Quantum\Hook\Exceptions\HookException` defines package-specific runtime errors
- `Quantum\Hook\Enums\ExceptionMessages` stores local exception message templates

## What the package actually does

`HookManager` creates a registry of hook names first, then allows listeners to be attached only to registered names.

When a hook is fired, the manager calls every queued listener for that hook and removes each listener from the store before invoking it. In practice, listeners are one-shot callbacks, not persistent subscriptions.

## Startup behavior

The constructor ensures a `hooks` config entry exists:

1. if `config()->has('hooks')` is false, it imports `config/hooks`
2. it merges `HookManager::CORE_HOOKS` with `config()->get('hooks') ?: []`
3. it registers each resulting hook name into the internal store

`CORE_HOOKS` is currently an empty array, so out of the box the package depends on the configured hook list.

## Important constraints

- hook names must be registered before `on()` or `fire()` can use them
- duplicate hook names fail during registration
- unregistered hook names fail both when attaching listeners and when firing
- listeners are consumed on first `fire()` call
- `fire()` always passes exactly one argument to each listener: the `?array $args` value
- a newly registered hook starts with an empty listener queue

## What the package does not do

The package is intentionally narrow.

It does not:

- provide listener priorities
- keep listeners after they are fired
- return values from listeners
- aggregate listener results
- expose a public API for registering new hook names after construction
- include wildcard hooks or pattern matching
