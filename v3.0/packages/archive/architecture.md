# Archive Architecture

Archive has three layers:

1. `ArchiveFactory` resolves an archive wrapper for a named adapter
2. `Archive` forwards package-level calls to the active adapter
3. the adapter performs the real PHAR or ZIP work

## Factory lifecycle

`ArchiveFactory::get()` is the usual entry point.

```php
$archive = ArchiveFactory::get(); // defaults to phar
```

The factory keeps one cached `Archive` instance per adapter type.

That cache lives inside the DI-managed factory instance, so repeated `get('phar')` or `get('zip')` calls return the same wrapper object for the life of the process.

If you switch archive names on a shared instance, later callers of the same adapter type will see that updated name.

## Wrapper behavior

`Archive` is intentionally thin. It exposes `getAdapter()` and forwards unknown method calls to the current adapter.

That gives you a stable package entry point without forcing every adapter method onto the wrapper class.

If you call a method the adapter does not implement, the wrapper throws an archive exception instead of silently ignoring it.

## Adapter state

Both built-in adapters are stateful.

They store:

- the archive path from `setName()`
- an opened archive handle
- enough internal state to reopen the handle after writes when needed

Because the wrapper and adapter can be shared through the factory cache, treat them as mutable process-local services rather than throwaway value objects.

## Storage integration

Both adapters depend on the Storage package through `FileSystemFactory::get()`.

That dependency is only used to verify source files before `addFile()` runs. Archive creation itself still uses PHP's PHAR or ZIP extensions directly.
