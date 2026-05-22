# Storage Architecture

The Storage package has two main workflows: filesystem access and upload persistence.

## Filesystem resolution flow

Most application code starts with `fs()`:

```php
$storage = fs();
$storage->put('reports/daily.txt', 'done');
```

Resolution works like this:

1. `fs()` calls `FileSystemFactory::get()`
2. the factory lazily imports `config/fs.php` if it is not loaded yet
3. the factory chooses the requested adapter or `fs.default`
4. the adapter is wrapped in `Quantum\Storage\FileSystem`
5. the resulting wrapper is cached per adapter name for later calls in the same process

That means repeated `fs('local')` calls reuse the same wrapper instance.

## Wrapper model

`Quantum\Storage\FileSystem` is a thin delegating wrapper around one adapter.

```php
$storage = fs('local');
$adapter = $storage->getAdapter();
```

The wrapper forwards method calls only when the active adapter actually implements them. Calling a method the adapter does not expose throws a storage exception.

## Upload pipeline

`UploadedFile` handles uploads in a stricter sequence:

1. read upload metadata from the request file array
2. derive name, extension, and MIME type from the local temporary file
3. load allowed MIME types from built-in defaults plus optional `uploads.allowed_mime_types`
4. validate the uploaded file and destination rules
5. store the file locally or through a remote adapter
6. optionally apply an image modification to the saved file path

This has one practical consequence: upload processing always needs a usable local filesystem adapter for the temporary file, even if the final destination is Dropbox or Google Drive.

## Cloud adapter composition

Cloud adapters are constructed from two parts:

- an adapter class that exposes the standard filesystem methods
- a cloud app class that performs OAuth-aware HTTP requests and token refresh

The factory creates the cloud app from config values under `fs.<adapter>.params.*` plus a service class from `fs.<adapter>.service`.

That service must implement `TokenServiceInterface` so the package can read and persist access and refresh tokens.
