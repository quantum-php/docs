# Migration

The Migration package gives Quantum a small, file-based schema migration workflow for relational databases. It generates migration class stubs, applies pending migrations from your project `migrations` directory, and records applied entries in a `migrations` table.

## When to use it

Use this package when you want schema changes to travel with your application code instead of being run manually.

A typical flow looks like this:

1. create a migration file in `base_dir()/migrations`
2. implement `up()` and `down()` on a class that extends `Quantum\Migration\Migration`
3. run upgrades to apply new files
4. run downgrades to revert the latest applied files when needed

## What the package manages

`Quantum\Migration\MigrationManager` is the package entry point. It handles three jobs:

- generate scaffold files for supported actions
- discover migration files under `base_dir()/migrations`
- apply or revert them with `Quantum\Database\Factories\TableFactory`

Applied migrations are tracked in a relational table named `migrations`.

## Supported actions

Generated scaffolds support these action names:

- `create`
- `alter`
- `rename`
- `drop`

Those action names are validated strictly. Anything else throws a `MigrationException`.

## Supported database drivers

The migration runner only accepts these drivers from the active database config:

- `mysql`
- `pgsql`
- `sqlite`

This package does not run against `sleekdb` or other non-relational adapters.

## Important constraints

- The `migrations` directory must already exist before you construct `MigrationManager`.
- Upgrade mode creates the tracking table automatically if it is missing.
- Downgrade mode does not create the tracking table; if it is missing, the call fails.
- The package expects every migration file basename to match a loadable class that extends `Migration`.
- Migration execution is not wrapped in a package-level transaction, so partial failures can leave schema changes applied before tracking rows are written or removed.
