# Archive Adapters

Quantum ships with two archive adapters.

They share the same top-level methods, but they are not identical in edge cases.

## PHAR adapter

Use `phar` when you want a PHAR archive.

```php
use Quantum\Archive\Factories\ArchiveFactory;

$archive = ArchiveFactory::get(); // phar by default
$archive->setName(storage_dir() . '/builds/app.phar');
```

### What it does well

- create archives by adding files, strings, and empty directories
- extract all files or a selected file list
- delete individual files or multiple files
- remove the whole archive through the adapter-specific `removeArchive()` method

### PHAR-specific notes

- `extractTo($path, $files)` forwards the optional `$files` argument, so partial extraction is supported
- `removeArchive()` exists only on the PHAR adapter; call it through `$archive->getAdapter()` when you need it
- add and delete operations usually return `false` on adapter-level failures instead of throwing

## ZIP adapter

Use `zip` when you want a ZIP archive.

```php
use Quantum\Archive\Enums\ArchiveType;
use Quantum\Archive\Factories\ArchiveFactory;

$archive = ArchiveFactory::get(ArchiveType::ZIP);
$archive->setName(storage_dir() . '/exports/reports.zip');
```

### What it does well

- create or reopen a ZIP archive at the configured path
- add files, strings, and directories
- delete entries and recount the archive after writes

### ZIP-specific notes

- `extractTo($path, $files)` ignores the second argument and always asks `ZipArchive` to extract the full archive
- after add or delete operations, the adapter reopens the archive handle before later reads so `count()` and `offsetExists()` see fresh state
- directory existence checks treat names without a dot as directory entries and normalize them with a trailing slash

## Choosing between them

Pick the adapter based on output format first.

Then account for the behavior differences:

- need partial extraction: use `phar`
- need adapter-level archive removal: use `phar`
- need ZIP output for interoperability: use `zip`
