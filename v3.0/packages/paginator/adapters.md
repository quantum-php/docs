# Paginator Adapters

Paginator behavior depends on which adapter you create.

## Array adapter

`ArrayPaginator` is the simple option for already-loaded data.

Use it when you have an in-memory array and want to slice it into pages without touching the database layer.

```php
$paginator = PaginatorFactory::create(PaginatorType::ARRAY, [
    'items' => $items,
    'perPage' => 20,
    'page' => 3,
]);
```

### Input contract

- `items` must be an array
- `perPage` is an integer
- `page` is an integer and defaults to `1`

### Returned data

- `data()` returns the current page slice as an array
- `firstItem()` and `lastItem()` return the first and last item from that slice
- when the current page has no items, `firstItem()` and `lastItem()` return `null`

### Good fit

Choose this adapter when the source data is already in memory, such as filtered config rows, API results you already fetched, or custom service output.

## Model adapter

`ModelPaginator` paginates a Quantum `DbModel` query.

Use it when you already have a model builder with criteria, ordering, or joins applied and you want a paginated result plus navigation metadata.

```php
$paginator = PaginatorFactory::create(PaginatorType::MODEL, [
    'model' => $postModel,
    'perPage' => 15,
    'page' => 2,
]);
```

### Input contract

- `model` must be a `DbModel` instance
- `perPage` is an integer
- `page` is an integer and defaults to `1`

### Returned data

- `data()` returns a `ModelCollection`
- `firstItem()` and `lastItem()` return models from that collection or `null` when the page is empty

### Query behavior that affects usage

- Build your filters and sorting first, then create the paginator.
- `data()`, `firstItem()`, and `lastItem()` may each trigger data loading, so fetch once and reuse when possible.
- If you paginate a named model class, returned rows are hydrated back into that model type.

## Shared adapter behavior

Both adapters share the same paging metadata API through `PaginatorInterface`, including:

- current, previous, next, and last page numbers
- current, previous, next, first, and last page links
- `links()` for the full page list
- `getPagination()` for ready-made HTML output
