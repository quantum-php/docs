# Migration Contracts

## Base migration class

Every runnable migration must extend `Quantum\Migration\Migration` and implement both methods:

```php
public function up(TableFactory $tableFactory): void;
public function down(TableFactory $tableFactory): void;
```

`up()` applies the schema change.

`down()` reverts it.

The manager rejects classes that do not extend `Migration`.

## File and class contract

The runner discovers `*.php` files from `base_dir()/migrations` and derives the class name from the file basename.

In practice, each file must define a class that can be instantiated by that basename and that class must extend `Migration`.

If the file loads but the class is not a valid migration, the package throws `MigrationException::invalidMigrationClass(...)`.

## Manager API

### `generateMigration(string $table, string $action): string`

Creates a scaffold file and returns the generated migration name without the `.php` extension.

Supported actions are limited to:

- `create`
- `alter`
- `rename`
- `drop`

### `applyMigrations(string $direction, ?int $step = null): ?int`

Runs the migration set in one of two directions:

- `MigrationManager::UPGRADE`
- `MigrationManager::DOWNGRADE`

Return value is the number of migrations processed.

Package behavior is exception-first, not "zero means nothing happened": when there is nothing to apply or revert, it throws `MigrationException::nothingToMigrate()` instead of returning `0`.

## Driver contract

The runner only accepts database configs whose `driver` is one of:

- `mysql`
- `pgsql`
- `sqlite`

Any other configured driver is rejected before migration work begins.

## Template caveats

The built-in templates are scaffolds, not guarantees.

Notable package-driven caveats:

- `rename` scaffolds reference `$newName`, which you still need to define
- `drop` scaffolds leave `down()` empty
- `create` and `alter` scaffolds only give you the starting table call; you still need to add the actual schema operations

Treat generated files as a starting point, then finish them manually.
