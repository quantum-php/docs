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

In practice, each file should define a class that can be instantiated by that basename and that class should inherit from `Migration`.

If the file loads but the class is not a valid migration, the package raises `MigrationException::invalidMigrationClass(...)`.

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

The built-in templates are scaffolds for starting a migration file.

Before you run a generated file, complete these package-driven details:

- align the generated method signatures with the base contract: `up(TableFactory $tableFactory): void` and `down(TableFactory $tableFactory): void`
- define `$newName` in `rename` scaffolds before using the rename calls
- add the schema operations that belong in `create` and `alter` scaffolds after the initial table lookup
- fill in `down()` for `drop` scaffolds when you want a reversible rollback path

Treat generated files as a starting point, then finish them for the schema change you want to ship.
