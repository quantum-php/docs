# Storage

The Storage package gives Quantum one API for local files, cloud-backed filesystems, and uploaded files.

Use it when you want to read and write files through `fs()`, or when you need to validate and persist uploaded files without hand-writing the same checks in every controller or service.

## When to use it

Reach for Storage when you need to:

- work with local files through a framework wrapper instead of raw PHP functions
- switch between `local`, `dropbox`, and `gdrive` adapters from configuration
- save uploaded files with MIME-type validation
- send uploads to a remote filesystem while keeping the same application-level workflow

## Package shape

The package is built from a few layers:

- `Quantum\Storage\FileSystem` is the wrapper your application code usually talks to
- `Quantum\Storage\Factories\FileSystemFactory` resolves adapters from `config/fs.php` and caches one wrapper per adapter name
- adapters implement `Quantum\Storage\Contracts\FilesystemAdapterInterface`
- `Quantum\Storage\UploadedFile` handles upload validation, naming, and persistence
- the global `fs()` helper resolves the shared filesystem wrapper

## Built-in adapters

Storage ships with three adapter names:

- `local`
- `dropbox`
- `gdrive`

If you call `fs()` without an adapter name, the factory imports `config/fs.php` on demand and uses `fs.default`.

## Upload support

`UploadedFile` is designed for request uploads, but it also works with local temporary files during tests or service-level processing.

Out of the box it allows these MIME/extension pairs:

- `image/jpeg` → `jpg`, `jpeg`
- `image/png` → `png`
- `application/pdf` → `pdf`

If `config/uploads.php` exists, its `uploads.allowed_mime_types` entries are merged into that default map before `save()` validates the file.

## Important constraints

A few behaviors matter in real applications:

- `FileSystemFactory` caches one `FileSystem` wrapper per adapter name inside the DI-managed factory service
- unsupported adapter names fail during resolution instead of falling back silently
- cloud adapters share the same wrapper API, but Dropbox operations use path-style names while most Google Drive operations work with Drive file or folder IDs
- `UploadedFile` still depends on the local adapter for extension parsing, MIME detection, and temporary-file reads even when you send the final file to a remote adapter
- image modifications run after the file is stored and expect a local writable path, so they are a poor fit for direct cloud uploads

For backend differences, see [Adapters](adapters.md). For upload behavior, see [Usage](usage.md) and [Contracts](contracts.md).
