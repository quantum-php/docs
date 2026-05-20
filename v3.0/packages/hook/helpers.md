# Hook Helpers

The package exposes one helper function.

## `hook()`

```php
function hook(): HookManager
```

Behavior:

1. checks whether `HookManager::class` is registered in DI
2. registers it if missing
3. returns `Di::get(HookManager::class)`

That means repeated `hook()` calls reuse the same `HookManager` instance for the current DI container.

## Practical effect of the shared instance

Because the helper resolves one shared manager:

- listeners added through `hook()->on(...)` stay on that shared instance until they are fired
- firing a hook through one call site affects listeners attached from other call sites using the same container
- constructor-time hook registration runs only when the shared manager is first created

## Failure cases

The helper itself does not catch errors.

It can surface:

- DI registration or resolution failures
- constructor failures from `HookManager`, including missing or invalid hook configuration
