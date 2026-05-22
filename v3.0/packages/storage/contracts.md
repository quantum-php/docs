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

`UploadedFile::save()` enforces this flow:

1. upload error must be `UPLOAD_ERR_OK`
2. temp file must exist
3. MIME+extension must pass policy
4. local destination must be valid (exists, writable)
5. overwrite is blocked unless explicitly enabled

Any failed check throws before file write.

## MIME policy contract

`UploadedFile` starts from built-in MIME rules, then merges `uploads.allowed_mime_types` from config.

Runtime overrides are supported via `setAllowedMimeTypes()`.

## Remote upload contract

When a remote adapter is attached with `setRemoteFileSystem(...)`:

- local destination checks are skipped
- upload payload is streamed from local temp file
- destination string is interpreted according to the remote adapter

## Cloud token contract

Cloud adapters rely on a service implementing `TokenServiceInterface`:

- `getAccessToken(): string`
- `getRefreshToken(): string`
- `saveTokens(string $accessToken, ?string $refreshToken = null): bool`
