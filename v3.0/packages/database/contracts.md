# Database Contracts

The Database package exposes two main interfaces.

## `DbalInterface`

`Quantum\Database\Contracts\DbalInterface` defines the common model-facing API for both relational and SleekDB adapters.

### Connection methods

- `connect(array $config)`
- `getConnection(): ?array`
- `disconnect()`

These are static, because adapter connections are stored at adapter-class level.

### Query-building methods

- `select(...$columns)`
- `criteria(string $column, string $operator, $value = null)`
- `criterias(...$criterias)`
- `having(string $column, string $operator, ?string $value = null)`
- `groupBy(string $column)`
- `orderBy(string $column, string $direction)`
- `offset(int $offset)`
- `limit(int $limit)`
- `isNull(string $column)`
- `isNotNull(string $column)`

All of these return the same adapter instance for fluent chaining.

### Result methods

- `get(): array`
- `count(): int`
- `asArray(): array`
- `findOne(int $id)`
- `findOneBy(string $column, $value)`
- `first()`

`get()` returns a list of adapter/model objects, not plain arrays.

### Mutation methods

- `create()`
- `prop(string $key, $value = null)`
- `save(): bool`
- `delete(): bool`
- `truncate(): bool`
- `deleteMany(): bool`

`prop()` doubles as getter and setter.

### Relation method

- `joinTo(DbModel $model, bool $switch = true)`

`joinTo()` relies on the current model's relation metadata. If the relation type or keys are missing, model-level exceptions are thrown when the join is validated.

## `RelationalInterface`

`Quantum\Database\Contracts\RelationalInterface` is only for relational adapters.

### Static raw-query methods

- `execute(string $query, array $parameters = []): bool`
- `query(string $query, array $parameters = []): array`
- `lastQuery(): ?string`
- `lastStatement(): object`
- `queryLog(): array`

These methods power `Database::execute()`, `Database::query()`, and the schema builder.

### SQL join methods

- `join(string $table, array $constraint, ?string $tableAlias = null)`
- `innerJoin(string $table, array $constraint, ?string $tableAlias = null)`
- `leftJoin(string $table, array $constraint, ?string $tableAlias = null)`
- `rightJoin(string $table, array $constraint, ?string $tableAlias = null)`

## Error surface

The package mostly raises `DatabaseException` for adapter/config/operator failures:

- unsupported adapter key
- unsupported query operator
- missing or incorrect database config
- schema table existence failures
- missing transactional method on the active adapter

Relation validation failures come from the Model package, not from `DatabaseException`.
