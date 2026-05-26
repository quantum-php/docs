# Model Contracts

This page focuses on the user-visible contracts exposed by the Model package.

## Attribute contracts

### `fill()` is strictly allowlisted

`Model::fill()` only accepts keys present in `$fillable`.

If any key is not allowed, the package throws `ModelException::inappropriateProperty(...)` and stops filling.

There is no silent ignore behavior.

### Direct assignment is not guarded

These write paths are different:

- `fill(['title' => 'Hello'])` checks `$fillable`
- `$model->title = 'Hello'` does not
- `$model->prop('title', 'Hello')` does not

Use `fill()` when you want mass-assignment protection.

### Hidden fields affect export, not storage

`$hidden` only changes `asArray()` output.

Hidden keys are still present in `$attributes`, still readable from the model object, and still available to persistence logic.

### `isEmpty()` checks visible exported data

`isEmpty()` delegates to `asArray()`.

A model with only hidden attributes can therefore look empty from this API.

## Database model contracts

### ORM-backed operations expect a factory-created model instance

DB-backed methods expect an attached ORM instance. When a model is created outside the package factory path, those methods raise `ModelException::ormIsNotSet()`.

In normal application code, use `model(Post::class)` instead of `new Post()`.

### Primary key stays outside `fill()` input

`DbModel::shouldFill()` always rejects the key that matches `$idColumn`, even if you put that key in `$fillable`.

Primary key values may still appear later when they come from hydration or after `save()` syncs the generated ID back from the ORM.

### Query-builder methods are proxied, not native model methods

Methods like these are forwarded to the DBAL adapter:

- `select()`
- `criteria()` and `criterias()`
- `having()`
- `groupBy()`
- `orderBy()`
- `offset()`
- `limit()`
- `joinTo()`
- `isNull()` and `isNotNull()`

If the active adapter does not implement a called method, `DbModel` throws `ModelException::methodNotSupported(...)`.

### Retrieval methods return fresh model objects

- `findOne()` returns one hydrated model or `null`
- `findOneBy()` returns one hydrated model or `null`
- `first()` returns one hydrated model or `null`
- `get()` returns `ModelCollection`

These methods do not return the same builder instance you queried on.

### `create()` resets attributes first

`DbModel::create()` clears the current model attributes and then calls `create()` on the ORM.

Treat it as the start of a new-record workflow, not as a way to preserve staged attributes.

### `save()` timestamp hook is opt-in by method presence

If the model has a `touchTimestamps()` method, `save()` calls it before syncing attributes into the ORM.

This is how `HasTimestamps` plugs in.

### `HasTimestamps` preserves `created_at` on first save and refreshes `updated_at` on every save

On a new record, `HasTimestamps` writes the created-at column only when that attribute is not already present.

That lets you seed a custom creation timestamp before the first `save()`.

The updated-at column is refreshed on every `save()`, including the first insert.

### `save()` never writes the current primary key value back into the ORM payload

During sync, the field matching `$idColumn` is skipped.

After a successful save, the package reads the ID from the ORM and stores it back in model attributes when present.

## Relation contracts

### Relation definitions are keyed by related model class name

`relations()` must return an array where each key is the fully qualified related model class.

### Required relation keys

Each relation used by `joinTo()` must provide:

- `type`
- `foreign_key`
- `local_key`

Missing definitions raise dedicated `ModelException` variants.

### Supported join relation types are narrower than the enum

`Relation::BELONGS_TO_MANY` exists as a constant, but current join handling supports these relation types:

- `Relation::HAS_ONE`
- `Relation::HAS_MANY`
- `Relation::BELONGS_TO`

For join queries, keep relation definitions within that set.

## Collection contracts

### Collections contain only model instances

`ModelCollection` validates every item. Non-model values raise `ModelException::notInstanceOf(...)`.

### Collection mutation is in-memory only

`add()` and `remove()` change the collection contents only. They do not save or delete anything in the database.

## Trait contracts

### Timestamp columns are configurable

`HasTimestamps` reads from constants first and public properties second:

- `CREATED_AT` or `$createdAt`
- `UPDATED_AT` or `$updatedAt`
- `TIMESTAMP_TYPE` or `$timestampType`

Supported timestamp types are effectively:

- `datetime` -> `Y-m-d H:i:s`
- `unix` -> `time()` integer

Any other value falls back to the datetime branch.

### Soft deletes are query-scope based

Without `withTrashed()`, soft-delete reads automatically add a `deleted_at IS NULL` style filter.

`onlyTrashed()` switches the model into trashed mode and also adds a `deleted_at IS NOT NULL` filter.

### Reused soft-delete builders keep accumulating scope filters

Each read method applies the soft-delete scope to the current ORM query before running.

A fresh model instance gives each query a clean scope. Reusing one long-lived builder can stack multiple soft-delete predicates onto the same query state.

### `withTrashed()` and `onlyTrashed()` mutate the current model instance

The include-trashed flag is stored on the model object. It is not automatically reset after one query.
