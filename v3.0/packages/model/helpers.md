# Model Helpers

The package ships three global helpers.

## `model(string $modelClass)`

Use this as the normal entry point for named models.

```php
use Modules\Blog\Models\Post;

$post = model(Post::class);
$latest = $post->orderBy('created_at', 'desc')->first();
```

Why it matters:

- validates that the class exists
- validates that the class extends `Quantum\Model\Model`
- attaches the active DBAL adapter automatically when the class extends `DbModel`

For database-backed models, this is safer than constructing the class manually.

## `dynamicModel(...)`

Use this when you want an anonymous `DbModel` for a table without creating a dedicated class.

```php
$logs = dynamicModel('audit_logs')
    ->criteria('level', '=', 'warning')
    ->orderBy('id', 'desc')
    ->limit(20)
    ->get();
```

Parameters:

- `$table` table/store name
- `$modelName` logical model name used by the DBAL layer, default `@anonymous`
- `$idColumn` primary key column, default `id`
- `$foreignKeys` relation definition map
- `$hidden` hidden field list

Practical caveat: anonymous models still depend on the active database adapter selected by the Database package.

## `wrapToModel(?DbalInterface $ormInstance, string $modelClass)`

This helper is mostly internal, but it explains how query results become models.

Behavior:

- returns `null` when the DBAL result is `null`
- creates a fresh model instance of `$modelClass`
- requires that class to extend `DbModel`
- hydrates attributes from `$ormInstance->asArray()`

Because it builds a fresh object, result models are detached from the query-builder model instance that produced them.
