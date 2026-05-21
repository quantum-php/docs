# Migration Architecture

The package is centered on `Quantum\Migration\MigrationManager`.

## Directory-based discovery

On construction, the manager resolves:

- the active database through `db()`
- a fresh `TableFactory`
- the migration directory at `base_dir() . DS . 'migrations'`

If that directory does not exist, construction stops immediately.

## Generation flow

`generateMigration($table, $action)` creates a PHP file in the migrations directory.

The generated filename follows this shape:

```text
<action>_table_<table>_<timestamp>.php
```

The template content comes from `Quantum\Migration\Templates\MigrationTemplate`.

Generation is only a scaffold step. The templates do not produce a finished migration on their own, so you should review and complete the file before running it.

## Upgrade flow

`applyMigrations(MigrationManager::UPGRADE)` works like this:

1. read the active database driver from `db()->getConfigs()`
2. reject unsupported drivers
3. ensure the `migrations` tracking table exists, creating it if needed
4. scan `migrations/*.php`
5. skip files already recorded in the tracking table
6. require each pending file, instantiate its class, and call `up($tableFactory)`
7. insert each applied migration name into the tracking table

Pending files are sorted by the timestamp suffix taken from the filename, so older timestamps run first.

## Downgrade flow

`applyMigrations(MigrationManager::DOWNGRADE, $step)` reads the applied rows from the tracking table, rebuilds file paths from the stored migration names, and calls `down($tableFactory)` in reverse timestamp order.

Behavior to know:

- without `$step`, the manager attempts to revert every recorded migration
- with `$step`, it selects only the most recently applied migrations
- if the tracking table does not exist, downgrade fails immediately

## Tracking table

The package defines its own internal migration class, `MigrationTable`, for the tracking table.

It creates:

- `id` as an auto-increment integer
- `migration` as a `VARCHAR(255)`
- `applied_at` as a timestamp with `CURRENT_TIMESTAMP` default

## Failure model

The manager updates tracking rows after the execution loop, not after each individual migration.

That means:

- if an upgrade fails halfway through, earlier schema changes may already be applied while none of the new rows have been inserted yet
- if a downgrade fails halfway through, earlier rollbacks may already be applied while tracked rows remain in place

If you need atomic behavior, you have to design it at the database or deployment level; this package does not provide it for you.
