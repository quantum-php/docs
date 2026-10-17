# Event Helpers

The package exposes one helper.

## `event()`

```php
function event(): EventManager
```

Returns the shared `EventManager`:

1. registers `EventManager::class` in DI if it is not registered yet
2. returns `Di::get(EventManager::class)`

Every `event()` call in the same app container returns the same manager, so a listener registered in one file is seen by a `dispatch()` anywhere else.

The helper loads together with the other framework helpers, at the start of the boot, which is why app and module helper files can already call it.
