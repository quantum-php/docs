# Using Archive

Use the factory when you want the framework-managed archive service.

## Create a ZIP archive

```php
use Quantum\Archive\Enums\ArchiveType;
use Quantum\Archive\Factories\ArchiveFactory;

$archive = ArchiveFactory::get(ArchiveType::ZIP);
$archive->setName(storage_dir() . '/exports/reports.zip');

$archive->addMultipleFiles([
    'app.php' => base_dir() . '/shared/config/app.php',
    'session.php' => base_dir() . '/shared/config/session.php',
]);
```

## Create a PHAR archive

```php
use Quantum\Archive\Factories\ArchiveFactory;

$archive = ArchiveFactory::get();
$archive->setName(storage_dir() . '/builds/app.phar');
$archive->addFromString('meta.txt', 'Build generated at deploy time');
```

## Add directories and in-memory content

```php
$archive->addEmptyDir('config');
$archive->addFromString('config/readme.txt', 'Package configuration files');
```

## Extract an archive

```php
$archive->extractTo(storage_dir() . '/tmp/unpacked');
```

For PHAR, you can also pass a selected file list or entry name as the second argument.

For ZIP, that second argument is currently ignored.

## Delete entries

```php
$archive->deleteFile('meta.txt');

$archive->deleteMultipleFiles([
    'config/readme.txt',
    'app.php',
]);
```

## Access adapter-specific behavior

Use `getAdapter()` when you need a capability that is not part of the shared wrapper contract.

```php
use Quantum\Archive\Adapters\PharAdapter;

$archive = ArchiveFactory::get();
$archive->setName(storage_dir() . '/builds/app.phar');

$adapter = $archive->getAdapter();

if ($adapter instanceof PharAdapter) {
    $adapter->removeArchive();
}
```

That pattern fits cases where you already know which adapter the factory resolved.

## Common pitfalls

- Forgetting `setName()` means the first real operation stops with an archive exception.
- Reusing `ArchiveFactory::get()` later in the same process gives you the same archive instance for that adapter type.
- `addMultipleFiles()` reports one final result, while entries added before the first returned `false` remain in the archive.
- ZIP `offsetExists()` is tuned for directory names without dots, so extensionless file entries are easiest to work with when you choose a clear archive entry name up front.
- ZIP extractions always extract the full archive, even if you pass a file list.
