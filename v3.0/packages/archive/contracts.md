# Archive Contracts

This page summarizes the behavior you can rely on when integrating Archive.

## Factory contract

`ArchiveFactory::get(string $type = ArchiveType::PHAR): Archive`

- defaults to `phar`
- supports `phar` and `zip`
- throws when the adapter name is unknown
- returns the same cached `Archive` instance for repeated calls with the same adapter type

## Setup contract

Before any archive operation, call:

```php
$archive->setName('/absolute/path/to/archive.zip');
```

If the name was not set, adapter operations throw an archive exception.

## Shared archive methods

The wrapper forwards these methods to both built-in adapters:

- `setName(string $archiveName): void`
- `offsetExists(string $filename): bool`
- `addEmptyDir(string $directory): bool`
- `addFile(string $filePath, ?string $entryName = null): bool`
- `addFromString(string $entryName, string $content): bool`
- `addMultipleFiles(array $fileNames): bool`
- `count(): int`
- `extractTo(string $pathToExtract, $files = null): bool`
- `deleteFile(string $filename): bool`
- `deleteMultipleFiles(array $fileNames): bool`

If you call another method through the wrapper and the active adapter does not implement it, the wrapper throws.

## File input contract

`addFile()` validates that the source file exists before adding it.

Missing source files raise an archive exception instead of returning `false`.

`addMultipleFiles()` expects an associative array of archive entry name => source file path.

Batch adds keep entries that were written before the first `false` result or exception path, so the method is best used when partial progress is acceptable or when you are writing into a fresh archive.

On the ZIP adapter, `addMultipleFiles()` converts missing-source and adapter exceptions into a final `false` result.

## Return-value contract

The package mixes exceptions and boolean failures.

Expect exceptions for:

- missing archive name
- unsupported adapter type
- missing source file for `addFile()`
- calling a method that the current adapter does not support
- archive open failures

Expect `false` for many adapter-level operational failures such as add, extract, and delete problems after the archive is already open.

## Adapter-specific contract gaps

These differences matter in real integrations:

- PHAR honors the optional `$files` argument in `extractTo()`
- ZIP ignores the optional `$files` argument in `extractTo()`
- PHAR exposes `removeArchive()` but ZIP does not
- ZIP treats dotless names passed to `offsetExists()` as directory lookups
