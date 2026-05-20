# Database Adapters

Quantum ships two concrete database adapters behind the shared `DbalInterface` contract.

## `IdiormDbal`

`Quantum\Database\Adapters\Idiorm\IdiormDbal` is the relational adapter used for:

- MySQL
- SQLite
- PostgreSQL

### Connection behavior

`connect()` builds an Idiorm configuration array from the selected driver config and stores the active connection in a static `$connection` property.

Driver-specific behavior:

- `sqlite` uses `sqlite:<database>`
- `mysql` and `pgsql` use `host`, `dbname`, optional `port`, and optional `charset`
- MySQL and PostgreSQL also set `username`, `password`, and a `PDO::MYSQL_ATTR_INIT_COMMAND` driver option for `SET NAMES <charset>`

`logging` is enabled when `config()->get('app.debug', false)` is truthy.

### Query behavior

Idiorm-backed models execute directly against the underlying SQL database. The adapter supports:

- raw `execute()` and `query()`
- query log and last-statement inspection
- transactions
- joins, including patched left/right joins through `IdiormPatch`

### Criteria behavior

Supported operators are:

- `=` `!=` `>` `>=` `<` `<=`
- `IN` `NOT IN`
- `LIKE` `NOT LIKE`
- `NULL` `NOT NULL`
- `#=#`

Special cases:

- `#=#` builds a raw column-to-column equality expression such as `profiles.country = events.country`
- passing `['fn' => '...']` as the value emits a raw right-hand-side expression instead of a bound parameter
- grouped OR conditions are built by passing nested criteria arrays to `criterias(...)`

### Result behavior

- `get()` returns cloned adapter objects with each row bound to its own ORM model
- `findOne()`, `findOneBy()`, and `first()` mutate the current adapter instance with the resolved row
- `asArray()` removes hidden fields if the model declared them
- `truncate()` runs `DELETE FROM <table>` rather than `TRUNCATE TABLE`

## `SleekDbal`

`Quantum\Database\Adapters\Sleekdb\SleekDbal` is the non-relational adapter for SleekDB stores.

### Connection behavior

`connect()` only stores the provided config. The actual `SleekDB\Store` instance is created lazily per model when `getOrmModel()` is called.

Required config details:

- `database_dir` must be present
- `config.primary_key` is overwritten with the model's `$idColumn`

If `database_dir` is missing, the adapter throws `DatabaseException::incorrectConfig()`.

### Query behavior

SleekDB does not implement the relational static query contract. Instead, it builds stateful query objects and resolves them through `QueryBuilder`.

Supported criteria operators are:

- `=` `!=` `>` `>=` `<` `<=`
- `IN` `NOT IN`
- `LIKE` `NOT LIKE`
- `BETWEEN` `NOT BETWEEN`

String criteria values are sanitized for regex-sensitive characters before they are stored.

### Join behavior

`joinTo()` records relation joins and applies them later when the builder is executed.

Two join modes matter:

- `joinTo($model)` or `joinTo($model, true)` nests the next join under the joined model
- `joinTo($model, false)` keeps the next join at the same parent level

This is how the package supports both nested relation trees and sibling relations.

### Related-criteria caveats

SleekDB has extra logic for criteria on joined models such as `profiles.firstname` or `user_meetings.tickets.type`.

Current behavior:

- related criteria are separated from root criteria and applied on the matching join path
- parent rows without matching joined data are filtered out after fetch
- if a related filter needs a relation root that was not selected, the adapter auto-selects it temporarily and removes it from the final payload afterward
- OR combinations across root and related scopes are not supported yet and raise a runtime exception
- an invalid dotted relation path behaves like an unmatched filter and can produce zero results

### Result behavior

Unlike Idiorm, SleekDB resets its builder state after result operations such as `get()`, `first()`, `findOne()`, `findOneBy()`, and `count()`. That keeps one query chain from leaking into the next one on the same model instance.
