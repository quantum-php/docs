# Model Architecture

The Model package layers plain attribute objects on top of database-aware models.

## Components

### `Model`

`Quantum\Model\Model` is the base class.

It owns:

- `$attributes` for the actual data store
- `$fillable` for mass-assignment allowlisting
- `$hidden` for array export filtering

Its API is small:

- `prop()` gets or sets one attribute
- `fill()` mass-assigns guarded data
- `asArray()` exports visible attributes
- `isEmpty()` checks whether the visible exported payload is empty

### `DbModel`

`Quantum\Model\DbModel` extends `Model` and adds a `DbalInterface` instance.

It does not implement SQL or file-database logic itself. Instead, it forwards supported methods to the active DBAL adapter through `__call()`.

That is why methods such as `select()`, `criteria()`, `orderBy()`, `limit()`, `joinTo()`, and `count()` appear on the model API even though they are really DBAL calls.

When a forwarded DBAL method returns another `DbalInterface`, `DbModel::__call()` returns the model itself so query chaining can continue.

## Factory flow

`ModelFactory::get()` is the package's model bootstrap path.

1. Validate that the requested class exists.
2. Instantiate it.
3. Ensure it extends `Model`.
4. If it is a `DbModel`, resolve the active ORM class from `db()->getOrmClass()`.
5. Create the DBAL instance with table name, model name, primary key, relations, and hidden fields.
6. Attach that DBAL instance to the model.

`dynamicModel()` follows the same DBAL creation path, but starts from an anonymous `DbModel` subclass.

## Query result flow

Query methods such as `findOne()`, `first()`, and `get()` do not return the raw DBAL rows.

Instead they call `wrapToModel()`:

1. create a new instance of the requested model class
2. attach the returned DBAL/ORM object
3. hydrate model attributes from `asArray()` on that ORM object

This means read results are fresh model objects, separate from the builder instance you used to assemble the query.

## Collection layer

`ModelCollection` wraps multiple model results.

It accepts either an array or another iterable. Validation is lazy for iterables and eager for arrays.

Important behavior:

- every item must be an instance of `Model`
- `first()` can stream from the original iterable before the whole collection is materialized
- `all()`, `count()`, and `last()` force full processing into the internal array

## Trait integration

### `HasTimestamps`

`DbModel::save()` checks for a `touchTimestamps()` method and calls it when present.

That makes timestamp handling trait-driven rather than built into every model.

### `SoftDeletes`

`SoftDeletes` overrides read and delete methods on the model itself.

It works by:

- replacing hard delete with an update to the deleted-at column
- adding an `isNull(deleted_at)` filter to reads unless trashed rows are explicitly included

Because this logic lives on the model, not in the DBAL package, soft-delete behavior follows the model instance and its query state.

## Serialization boundary

`DbModel::__sleep()` serializes only:

- `table`
- `idColumn`
- `hidden`
- `attributes`

It does not serialize the live ORM instance.

That matters for code paths that serialize joined models internally, especially with the SleekDB join implementation. Query state is runtime-only and should not be treated as persistent model state.
