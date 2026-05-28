# Database

## Overview

Quantum resolves the active database adapter from `config/database.php` (`database.default`) and connects lazily through `Quantum\Database\Database`.

Supported adapter keys:

- `mysql` → `IdiormDbal`
- `sqlite` → `IdiormDbal`
- `pgsql` → `IdiormDbal`
- `sleekdb` → `SleekDbal`

## Configuration

A typical `config/database.php` uses this shape:

```php
return [
    'default' => 'sleekdb', // or mysql/sqlite/pgsql

    'mysql' => [
        'driver' => 'mysql',
        'host' => 'localhost',
        'dbname' => 'app',
        'username' => 'root',
        'password' => '',
        'charset' => 'utf8',
    ],

    'sqlite' => [
        'driver' => 'sqlite',
        'database' => 'database.sqlite',
    ],

    'sleekdb' => [
        'database_dir' => base_dir() . DS . 'shared' . DS . 'store',
        'config' => [/* SleekDB options */],
    ],
];
```

## Accessing Database Runtime

Use the helper:

```php
$db = db(); // returns Quantum\Database\Database
$adapterClass = $db->getOrmClass();
$config = $db->getConfigs();
```

## SQL-only Raw Query APIs

These `Database` static methods are forwarded to the active adapter:

- `Database::execute($sql, $params)`
- `Database::query($sql, $params)`
- `Database::fetchColumns($table)`
- `Database::lastQuery()`
- `Database::queryLog()`

Important: these APIs are implemented by `IdiormDbal` (SQL adapters). If `database.default` is `sleekdb`, SQL-only methods are not supported.

## Transactions

`Database::beginTransaction()`, `commit()`, `rollback()`, and `transaction(callable)` are available when using SQL adapters (`mysql`, `sqlite`, `pgsql`).

## Querying Data (recommended path)

Use `DbModel` via `model()` helper for app-level data access:

```php
$user = model(\Modules\App\Models\User::class)
    ->criteria('email', '=', 'john@example.com')
    ->first();
```

This keeps adapter-specific details behind model and service layers.

## Best Practices

- Keep `database.default` explicit per environment.
- Use models/services for business queries; use raw SQL only when needed.
- Use migrations for schema changes.

## What to read next

After database setup and usage, continue with:

- [Migration](migration.md)
- [Models](../core-concepts/models.md)
- [Services](../core-concepts/services.md)
