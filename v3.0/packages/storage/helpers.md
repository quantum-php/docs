# Storage Helpers

## `fs()`

```php
function fs(?string $adapter = null): FileSystem
```

Use this as the standard entry point.

```php
fs()->put(storage_dir() . '/app.log', 'ready');
$content = fs()->get(storage_dir() . '/app.log');
```

Pick an adapter explicitly only when needed:

```php
$dropbox = fs('dropbox');
$local = fs('local');
```

## Helper behavior

- no adapter passed → uses `fs.default`
- first call lazily imports `config/fs.php`
- repeated calls reuse cached wrapper per adapter name in the current process

Use configuration + service wiring for cloud OAuth/token setup, not ad hoc helper-side logic.
