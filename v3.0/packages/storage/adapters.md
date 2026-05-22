# Storage Adapters

Quantum ships with one local adapter and two cloud adapters. They share the same top-level `FileSystem` wrapper, but their naming and destination rules are not identical.

## Local adapter

Use `local` when files live on the same server as your app.

```php
$fs = fs('local');
$fs->put(storage_dir() . '/notes.txt', 'Hello');
```

### What it supports well

The local adapter is the most complete adapter in the package. In addition to the shared filesystem methods, it also provides local-only operations such as:

- `glob()`
- `isReadable()`
- `isWritable()`
- `getLines()`
- `fileName()`
- `fileNameWithExtension()`
- `extension()`
- `require()` and `include()`

### Local adapter caveats

- `makeDirectory()` uses plain `mkdir($dirname)`, so it does not create nested directories for you
- `removeDirectory()` only removes empty directories
- `exists()` returns `true` only for files, not for directories
- `listDirectory()` returns resolved absolute paths, not raw child names

## Dropbox adapter

Use `dropbox` when your app should read and write files by Dropbox path.

```php
$fs = fs('dropbox');
$fs->put('exports/report.csv', $csv);
```

### Naming contract

Dropbox operations use path-like names such as `exports/report.csv`. The adapter normalizes them to Dropbox API paths with a leading slash.

### Behavior notes

- `put()` always uploads with overwrite mode
- `append()` is implemented as read-then-write, so it is not an atomic append operation
- `exists()` delegates to `isFile()`, so directory checks still require `isDirectory()`
- most adapter failures are converted to `false` instead of being rethrown directly

## Google Drive adapter

Use `gdrive` when files should live in Google Drive.

```php
$fs = fs('gdrive');
$fs->makeDirectory('Invoices');
```

### Naming contract

Google Drive is less path-oriented than Dropbox.

- `makeDirectory('Invoices')` creates a folder by name under `root` unless you pass a parent ID
- `put('invoice.pdf', $content, $parentId)` creates a new file by name under a parent folder ID
- once a file exists, most later operations (`get()`, `rename()`, `remove()`, `copy()`, `isFile()`, `isDirectory()`) expect a Google Drive file or folder ID rather than a path

Treat that adapter as ID-based after creation.

### Behavior notes

- `copy($source, $dest)` copies a file ID into a destination folder ID, defaulting to `root`
- `append()` is also read-then-write rather than atomic
- `listDirectory($dirname)` expects a folder ID and returns the Drive API `files` list for that parent
- adapter failures are returned as `false`

## Cloud auth requirements

Both cloud adapters depend on a token service class configured under `fs.<adapter>.service`.

That service must implement `Quantum\Storage\Contracts\TokenServiceInterface` so the package can:

- get the current access token
- get the refresh token
- save new tokens after the first OAuth exchange or an automatic refresh

If the service does not implement that contract, adapter resolution fails before any file operation runs.
