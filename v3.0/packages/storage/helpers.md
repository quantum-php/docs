# Storage Helpers

The package exposes one global resolver helper.

## `fs()`

```php
function fs(?string $adapter = null): FileSystem
```

Use this as the normal entry point for filesystem work.

```php
fs()->put(storage_dir() . '/app.log', 'ready');
$content = fs()->get(storage_dir() . '/app.log');
```

Pass an adapter name when you need a specific backend:

```php
$dropbox = fs('dropbox');
$local = fs('local');
```

## Helper behavior

A few helper details matter in real apps:

- `fs()` resolves through `FileSystemFactory::get()`
- the first call lazily imports `config/fs.php` when needed
- when no adapter is passed, the helper uses `fs.default`
- repeated calls reuse the cached wrapper for that adapter name in the current process

Because the helper returns the wrapper, not a raw cloud app, OAuth setup and token persistence should live in your own service layer and config rather than in ad hoc helper usage.
