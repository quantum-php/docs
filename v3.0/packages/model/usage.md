# Model Usage

## Create and save a record

```php
use Modules\Blog\Models\Post;

$post = model(Post::class)
    ->create()
    ->fill([
        'title' => 'Quantum 3.0',
        'slug' => 'quantum-3',
        'body' => 'Package notes',
        'author_id' => 7,
    ]);

$post->save();
```

What happens here:

1. `create()` starts a new record context and clears current attributes.
2. `fill()` applies only allowed fields.
3. `save()` copies attributes into the ORM.
4. If the adapter generated a primary key, the model receives it back after save.
5. If `HasTimestamps` is used, timestamp fields are updated before persistence.

## Query records with a builder

```php
$posts = model(Post::class)
    ->criteria('status', '=', 'published')
    ->orderBy('created_at', 'desc')
    ->limit(10)
    ->get();
```

This returns a `ModelCollection`, not a plain array.

Useful collection methods:

- `all()`
- `count()`
- `first()`
- `last()`
- `isEmpty()`

Use a fresh model instance for unrelated queries to avoid carrying accidental query state.

## Prefer a fresh model for unrelated queries

`DbModel` query methods mutate the current model instance.

That means this pattern is safer:

```php
$published = model(Post::class)
    ->criteria('status', '=', 'published')
    ->get();

$drafts = model(Post::class)
    ->criteria('status', '=', 'draft')
    ->get();
```

Instead of continuing to reuse one already-filtered model instance across unrelated queries.

## Define and use joins through `relations()`

```php
use Quantum\Database\Enums\Relation;

class Post extends DbModel
{
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

Then query with:

```php
$posts = model(Post::class)
    ->joinTo(model(User::class))
    ->select('posts.*')
    ->get();
```

Keep relation definitions explicit. Missing `type`, `foreign_key`, or `local_key` fails fast.

## Paginate model queries

```php
$paginator = model(Post::class)
    ->criteria('status', '=', 'published')
    ->paginate(15, 2);

$items = $paginator->data();
$total = $paginator->total();
```

The paginator clones the model and ORM for the total-count query so total calculation does not mutate the live query before page data is fetched.

## Use soft deletes

```php
$post = model(Post::class)->findOne(10);
$post?->delete();

$active = model(Post::class)->get();
$all = model(Post::class)->withTrashed()->get();
$trashed = model(Post::class)->onlyTrashed()->get();
```

Behavior to remember:

- `delete()` becomes a soft delete when the trait is used
- `forceDelete()` performs the real delete
- `restore()` clears the deleted-at value
- `withTrashed()` changes later reads on that same model instance

## Use plain models for non-database payloads

```php
use Quantum\Model\Model;

class PublishPayload extends Model
{
    protected array $fillable = ['title', 'slug'];
    public array $hidden = ['slug'];
}

$payload = (new PublishPayload())->fill([
    'title' => 'Hello',
    'slug' => 'hello',
]);

$data = $payload->asArray();
```

Here `asArray()` returns only visible fields, while `slug` is still stored on the object.

## Common caveats

- `new Post()` does not attach an ORM instance by itself.
- `fill()` rejects unknown fields instead of ignoring them.
- Direct assignment bypasses `fillable` rules.
- `create()` clears existing attributes.
- Soft-delete inclusion flags stay on the current model instance until you discard it.
