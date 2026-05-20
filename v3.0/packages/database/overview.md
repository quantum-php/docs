# Database

The Database package is Quantum's storage bridge for both SQL databases and SleekDB document stores. It does two jobs:

- boot the configured database adapter once per process through `db()` / `Quantum\Database\Database`
- expose a common query contract that Quantum models can use without caring whether the backend is relational or file-based

## Entry points

### `db()` helper

`db()` lazily registers `Quantum\Database\Database` in the DI container and always returns the same container-managed instance.

That means repeated calls during the same process reuse the same `Database` object and the same underlying adapter connection.

### `Database` facade behavior

On construction, `Database`:

1. loads `config/database` if it is not already loaded
2. reads `database.default`
3. resolves the adapter class from `Database::ADAPTERS`
4. stores the selected adapter config from `database.<default>`
5. connects only if the adapter reports no active connection yet

Supported adapter keys are:

- `sleekdb` → `Quantum\Database\Adapters\Sleekdb\SleekDbal`
- `mysql` → `Quantum\Database\Adapters\Idiorm\IdiormDbal`
- `sqlite` → `Quantum\Database\Adapters\Idiorm\IdiormDbal`
- `pgsql` → `Quantum\Database\Adapters\Idiorm\IdiormDbal`

Unknown adapter keys fail with `DatabaseException::adapterNotSupported(...)`.

## What the package exposes

### Raw database access

`Database` forwards static raw operations to the active adapter:

- `Database::execute($query, $parameters)`
- `Database::query($query, $parameters)`
- `Database::lastQuery()`
- `Database::queryLog()`

These methods only work when the selected adapter implements the needed static API. In practice, raw query support is provided by the Idiorm-based relational adapter.

### Transaction helpers

`Database` also exposes:

- `Database::beginTransaction()`
- `Database::commit()`
- `Database::rollback()`
- `Database::transaction(fn () => ...)`

The closure-based wrapper begins a transaction, commits on success, and always rolls back before rethrowing any exception.

## Configuration shape

The package expects `config/database.php` to define a `default` key and a matching configuration block.

Typical test fixture shape:

```php
return [
    'default' => 'sqlite',
    'mysql' => [
        'driver' => 'mysql',
        'host' => 'localhost',
        'dbname' => 'database',
        'username' => 'username',
        'password' => 'password',
        'charset' => 'charset',
    ],
    'sqlite' => [
        'driver' => 'sqlite',
        'database' => ':memory:',
    ],
    'sleekdb' => [
        'config' => [
            'auto_cache' => true,
        ],
        'database_dir' => base_dir() . DS . 'shared' . DS . 'store',
    ],
];
```

## Important constraints

- Connection setup is lazy, but only the first `Database` construction performs adapter connection work.
- `db()` is DI-backed, so swapping config mid-process does not automatically rebuild the `Database` instance.
- `Database::getOrmClass()` returns the adapter class name, not a model instance.
- `Database::getConfigs()` returns only the selected adapter block, not the full `database` config tree.
- Raw query helpers assume the adapter has matching static methods. SleekDB does not implement the relational raw-query contract.
