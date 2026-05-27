# Storage Contracts

This page defines stable behavior you can build against.

## Wrapper contract

`fs()` returns `Quantum\Storage\FileSystem`.

The wrapper forwards calls only when supported by the active adapter. Unsupported calls throw a storage exception.

## Shared filesystem contract

All built-in adapters implement core file operations (read, write, delete, exists, metadata, directory operations).

Typical return behavior:

- booleans for success/failure checks
- content or `false` for reads
- bytes written or `false` for writes

## Local-only contract

Methods from `LocalFilesystemAdapterInterface` are local-only features (globbing, readability checks, extension helpers, include helpers).

Use them only when the adapter is known to be local.

## Upload validation contract

`UploadedFile::save()` applies this flow:

1. upload status is read from the PHP upload metadata
2. the temp file path is verified through the local adapter
3. MIME+extension is matched against the active policy
4. local destinations are prepared through directory and overwrite checks
5. the file is written locally or forwarded to the configured remote adapter

Validation exceptions are raised before persistence when one of those checks does not pass.

## MIME policy contract

`UploadedFile` starts from built-in MIME rules, then merges `uploads.allowed_mime_types` from config when that file is present.

Runtime overrides are supported via `setAllowedMimeTypes()`. With the default `merge: true`, your additions are layered on top of the built-in rules. Pass `merge: false` when you want the runtime policy to become the full allow-list for that instance.

## Remote upload contract

When a remote adapter is attached with `setRemoteFileSystem(...)`:

- local destination checks are skipped
- the upload payload is still read from the PHP temp file through the local adapter
- the destination string is interpreted according to the remote adapter

That makes path-based adapters straightforward with `UploadedFile::save()`. For Google Drive parent-folder placement, the adapter-level `put($filename, $content, $parentId)` call is the clearer fit.

## Non-HTTP source contract

`UploadedFile::save()` also works with files constructed from non-upload temp paths in tests and CLI code. In that case, the storage layer copies the source file into the destination instead of using PHP's upload move path.

## Cloud token contract

Cloud adapters rely on a service implementing `TokenServiceInterface`:

- `getAccessToken(): string`
- `getRefreshToken(): string`
- `saveTokens(string $accessToken, ?string $refreshToken = null): bool`
