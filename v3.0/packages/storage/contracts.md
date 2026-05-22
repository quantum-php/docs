# Storage Contracts

This package stays small at the surface, but a few contracts shape how you can safely build on it.

## Wrapper contract

`Quantum\Storage\FileSystem` wraps one adapter instance.

```php
$storage = fs();
$adapter = $storage->getAdapter();
```

The wrapper forwards calls only when the active adapter implements that method. Unsupported calls throw a storage exception instead of silently doing nothing.

## Shared filesystem contract

All built-in adapters implement `FilesystemAdapterInterface`, which gives you these core operations:

- create and remove directories
- read and write files
- append, rename, copy, and delete files
- check existence, type, size, and last-modified time
- list directory contents

The return contract is intentionally simple:

- boolean methods return `true` or `false`
- read methods usually return content or `false`
- write methods usually return bytes written or `false`

Cloud adapters prefer `false` on operation failure. Resolution-time problems, unsupported methods, and invalid package setup fail with exceptions.

## Local-only contract

`LocalFilesystemAdapterInterface` extends the shared adapter contract with local filesystem features:

- globbing
- readability and writability checks
- line-based reads
- filename and extension helpers
- PHP file inclusion helpers

Those methods are only safe to rely on when you know the active adapter is local.

## Upload validation contract

`UploadedFile::save()` validates uploads in this order:

1. PHP upload error must be `UPLOAD_ERR_OK`
2. the temporary file must exist locally
3. the extension and detected MIME type must match the active upload policy
4. local destinations must already exist and be writable
5. local destinations must not already contain the target file unless `$overwrite` is `true`

If any of those checks fail, the package throws a file upload or filesystem exception before writing the file.

## MIME policy contract

`UploadedFile` starts with a built-in MIME map and then lazily merges `uploads.allowed_mime_types` from `config/uploads.php` when `save()` is called.

You can override that at runtime:

```php
$file->setAllowedMimeTypes([
    'image/webp' => ['webp'],
], merge: true);
```

Use `merge: false` when you want to replace the whole policy instead of extending it.

## Remote upload contract

You can send uploads to a remote adapter by attaching one before `save()`:

```php
$file->setRemoteFileSystem(fs('dropbox')->getAdapter());
```

When a remote adapter is set:

- the package skips local destination directory checks
- the upload payload is read from the local temporary file and passed to the remote adapter's `put()` method
- the destination string is treated as the remote path or remote file identifier expected by that adapter

## Token service contract

Cloud adapter setup requires a service that implements `TokenServiceInterface`:

- `getAccessToken(): string`
- `getRefreshToken(): string`
- `saveTokens(string $accessToken, ?string $refreshToken = null): bool`

The package uses that service both for the first OAuth token exchange and for automatic access-token refresh after a `401` response from a cloud API.
