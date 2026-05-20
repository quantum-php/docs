# Hook Architecture

## Core object

The package is centered on `Quantum\Hook\HookManager`.

It keeps one internal property:

```php
private array $store = [];
```

The store shape is:

```php
array<string, array<int, callable>>
```

Each key is a registered hook name. Each value is the queued listeners for that hook.

## Registration model

Hook names are created through the protected `register()` method.

Registration rules are simple:

- if the name already exists in `$store`, `register()` throws `HookException::hookDuplicateName()`
- otherwise it creates an empty array for that hook name

Because `register()` is protected, package consumers cannot add hook names directly through the public API. Public use depends on whatever hook names were loaded during construction.

## Listener lifecycle

`on(string $name, callable $function)` appends the callable to `$store[$name][]`.

Before that, it checks `exists($name)`. If the hook name is unknown, it throws `HookException::unregisteredHookName()`.

There is no deduplication for listeners. The same callable can be queued multiple times.

## Fire lifecycle

`fire(string $name, ?array $args = null)` also validates the hook name first.

It then iterates over the queued listeners for that hook:

```php
foreach ($this->store[$name] as $index => $fn) {
    unset($this->store[$name][$index]);
    $fn($args);
}
```

This has two important consequences:

- each listener is removed before it runs
- firing the same hook again does nothing unless new listeners were added after the previous fire

The package therefore behaves more like a deferred callback queue than a reusable publish-subscribe bus.

## Read access

`getRegistered()` returns the full internal store.

That includes registered hook names and their currently queued listeners. It is a snapshot of the manager state at the time of the call.

## Error surface

The package defines two package-specific runtime errors:

- duplicate hook registration -> `HookException::hookDuplicateName()`
- missing hook name -> `HookException::unregisteredHookName()`

The constructor can also surface dependency errors from config loading and DI resolution because it calls `config()` and may import `config/hooks` automatically.
