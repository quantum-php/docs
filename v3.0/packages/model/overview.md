# Model

The Model package gives Quantum two data shapes:

- `Quantum\Model\Model` for plain in-memory objects with guarded mass assignment
- `Quantum\Model\DbModel` for database-backed records that query through the active DBAL adapter

Use `Model` when you want a small data object with `fillable` and `hidden` rules. Use `DbModel` when the class should also load, query, save, paginate, or delete database records.

## Typical model shape

```php
namespace Modules\Blog\Models;

use Quantum\Database\Enums\Relation;
use Quantum\Model\DbModel;
use Quantum\Model\Traits\HasTimestamps;
use Quantum\Model\Traits\SoftDeletes;

class Post extends DbModel
{
    use HasTimestamps;
    use SoftDeletes;

    public string $table = 'posts';

    public array $fillable = [
        'title',
        'slug',
        'body',
        'author_id',
    ];

    public array $hidden = [
        'deleted_at',
    ];

    public function relations(): array
    {
        return [
            User::class => [
                'type' => Relation::BELONGS_TO,
                'foreign_key' => 'author_id',
                'local_key' => 'id',
            ],
        ];
    }
}
```

## What the package manages

At runtime, the package is responsible for:

- building model instances with `model()` or `ModelFactory`
- attaching the active database adapter to `DbModel` classes
- wrapping DBAL results back into model objects
- exposing collection results through `ModelCollection`
- adding optional timestamp and soft-delete behavior through traits

## Entry points

### `model(Foo::class)`

Use `model()` when you want a normal model class instance.

For plain `Model` subclasses, it returns a new object.

For `DbModel` subclasses, it also creates and attaches the ORM/DBAL instance for the current configured database driver.

### `dynamicModel(...)`

Use `dynamicModel()` when you need a lightweight anonymous `DbModel` for table-level work without creating a named class.

This is useful for one-off internal queries, admin tooling, or package code that needs a table wrapper but not a full domain model class.

### `wrapToModel(...)`

This helper is used internally when query results need to come back as model objects. It returns `null` for missing records and otherwise hydrates a new `DbModel` instance from the DBAL row.

## Important package rules

- `fill()` only accepts keys listed in `$fillable`.
- Direct property assignment like `$post->title = '...'` bypasses `$fillable` checks.
- `asArray()` hides keys listed in `$hidden`, but the raw properties still exist on the model.
- `DbModel::save()` skips writing the primary key field back into the ORM payload and then syncs the generated key from the ORM after save.
- Query methods mutate the current `DbModel` instance. Reuse the same instance only when you want to keep building on the same query state.
- The package supports relation definitions, but join behavior only works for relation types the DBAL adapters implement today: `hasOne`, `hasMany`, and `belongsTo`.
- `belongsToMany` exists in the `Relation` enum but is not handled by `joinTo()`.
