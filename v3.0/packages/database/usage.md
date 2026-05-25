# Database Usage

This package is usually consumed indirectly through Quantum models, but the underlying API is available directly.

## Raw queries and transactions

```php
use Quantum\Database\Database;

$rows = Database::query(
    'SELECT * FROM profiles WHERE id = :id',
    ['id' => 1]
);

Database::transaction(function () {
    Database::execute(
        'INSERT INTO profiles (firstname, lastname, age, country) VALUES (:firstname, :lastname, :age, :country)',
        [
            'firstname' => 'John',
            'lastname' => 'Doe',
            'age' => 56,
            'country' => 'Spain',
        ]
    );
});
```

The transaction wrapper commits the callback result on success and rolls back automatically on any thrown exception.

## Fluent model queries

The common adapter contract supports fluent reads such as:

```php
$users = $userModel
    ->criteria('email', 'LIKE', '%jane%')
    ->orderBy('id', 'desc')
    ->limit(10)
    ->get();
```

You can also group OR criteria by nesting them inside `criterias(...)`:

```php
$events = $eventModel
    ->criterias(
        [
            ['title', '=', 'Music'],
            ['title', '=', 'Design'],
        ],
        ['country', '=', 'Ireland']
    )
    ->get();
```

For Idiorm, a criteria value shaped like `['fn' => 'date("now")']` is inserted as a raw SQL expression.

If you need paging, pair `offset()` with `limit()`. Quantum treats offset as part of a bounded result window rather than a standalone skip.

## Joining related models

`joinTo()` uses relation metadata defined on Quantum `DbModel` classes.

```php
$users = $userModel
    ->joinTo($profileModel)
    ->criteria('profiles.firstname', '=', 'Jane')
    ->get();
```

Backend-specific notes:

- on SQL adapters, `joinTo()` becomes a SQL join using relation keys
- on SleekDB, dotted criteria such as `profiles.firstname` are routed to the joined store and filtered again after fetch
- on SleekDB, mixing related-path filters with OR criteria is currently unsupported

## Working with records

```php
$user = $userModel->findOne(1);

$user->prop('firstname', 'Alice');
$user->save();

$data = $user->asArray();
```

Behavior differences to keep in mind:

- `findOne()`, `findOneBy()`, and `first()` mutate the current instance with the resolved row
- on Idiorm, a lookup miss leaves the instance unchanged; on SleekDB, a lookup miss clears the instance data
- `get()` returns cloned items for each result row
- hidden fields are removed only when you call `asArray()`

For predictable lookup code, avoid reusing an already-hydrated model instance for a second `findOne()` or `findOneBy()` call unless you handle the adapter-specific miss behavior.

## Building tables in migrations

```php
use Quantum\Database\Enums\Type;
use Quantum\Database\Factories\TableFactory;

$table = (new TableFactory())->create('profiles');
$table->addColumn('id', Type::INT, 11)->autoIncrement();
$table->addColumn('firstname', Type::VARCHAR, 255);
$table->addColumn('lastname', Type::VARCHAR, 255);
```

In this API, SQL is executed when the `Table` object is destroyed. Keep the table object alive until you finish describing the whole table change.
