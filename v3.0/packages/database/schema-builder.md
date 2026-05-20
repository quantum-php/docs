# Schema Builder

The Database package includes a small SQL schema builder used by migrations through `Quantum\Database\Factories\TableFactory` and `Quantum\Database\Schemas\Table`.

## `TableFactory`

`TableFactory` is a guard layer around `Table`.

It provides four operations:

- `create($name)`
- `get($name)`
- `rename($oldName, $newName)`
- `drop($name)`

Before acting, it checks table existence by running `Database::query('SELECT 1 FROM ' . $name)`.

That means:

- existence checks rely on the active relational adapter
- a failed probe is treated as "table does not exist"
- this factory is not intended for SleekDB stores

## `Table` lifecycle

A `Table` instance accumulates schema changes and executes them when the object is destroyed.

That is the most important behavior in this API: **SQL execution is destructor-driven**.

Typical flow:

1. `TableFactory` creates or resolves a `Table`
2. the table action is set to create, alter, rename, or drop
3. column and index operations are chained on the object
4. `Table::__destruct()` calls `save()`
5. `save()` generates SQL and sends it to `Database::execute(...)`

If the generated SQL is empty, nothing is executed.

## Supported table actions

`Table` supports these action constants:

- `CREATE`
- `ALTER`
- `DROP`
- `RENAME`

The generated SQL differs by action:

- create → `CREATE TABLE ...`
- alter → `ALTER TABLE ...`
- rename → `RENAME TABLE ... TO ...`
- drop → `DROP TABLE ...`

## Column operations

The fluent API can:

- `addColumn($name, $type, $constraint)`
- `modifyColumn($name, $type, $constraint)`
- `renameColumn($oldName, $newName)`
- `dropColumn($name)`
- `addIndex($columnName, $indexType, $indexName = null)`
- `dropIndex($indexName)`
- `after($columnName)`

After adding or modifying a column, `Table::__call()` forwards column modifiers to `Quantum\Database\Schemas\Column`.

Supported column modifiers include:

- `autoIncrement()`
- `primary()`
- `index()`
- `unique()`
- `fulltext()`
- `spatial()`
- `nullable()`
- `default($value, $quoted = true)`
- `attribute($value)`
- `comment($value)`

## SQL generation details

A few implementation details matter when writing migrations:

- type names are uppercased by `Column`
- enum constraints become `ENUM('a', 'b', ...)`
- `autoIncrement()` also marks the column as a primary key
- default values are quoted unless `default(..., false)` is used
- rename and drop column actions intentionally omit unrelated column attributes
- indexes are emitted after column definitions in create/alter SQL
- dropped indexes are appended as `DROP INDEX ...`

## Caveats

- Because execution happens in `__destruct()`, work is applied when the object goes out of scope, not when each fluent method is called.
- `rename()` and `drop()` on `TableFactory` return `true` after preparing the `Table`; the actual SQL is still performed by the temporary object's destructor.
- `Table::checkColumnExists()` exists internally but is not used to block duplicate or missing column operations.
- The builder emits MySQL-style SQL such as backtick-quoted identifiers and `RENAME TABLE`, so it is a relational migration helper rather than a cross-adapter abstraction.
