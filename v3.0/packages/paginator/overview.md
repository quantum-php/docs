# Paginator

The Paginator package wraps paginated data behind one consistent API.

Use it when you need page-aware results, navigation links, or ready-made pagination HTML for either:

- plain PHP arrays
- Quantum `DbModel` queries

## What the package provides

The package centers on `Quantum\Paginator\Paginator`, a thin wrapper around one adapter instance. In practice, you usually create it through `PaginatorFactory` and then call the same methods regardless of data source.

Supported adapter types are:

- `PaginatorType::ARRAY`
- `PaginatorType::MODEL`

## Basic example

### Paginating an array

```php
use Quantum\Paginator\Enums\PaginatorType;
use Quantum\Paginator\Factories\PaginatorFactory;

$paginator = PaginatorFactory::create(PaginatorType::ARRAY, [
    'items' => $rows,
    'perPage' => 10,
    'page' => 2,
]);

$data = $paginator->data();
$links = $paginator->links();
$html = $paginator->getPagination();
```

### Paginating a model query

```php
use Quantum\Paginator\Enums\PaginatorType;
use Quantum\Paginator\Factories\PaginatorFactory;

$paginator = PaginatorFactory::create(PaginatorType::MODEL, [
    'model' => $postModel,
    'perPage' => 15,
    'page' => 1,
]);

$posts = $paginator->data();
```

## Defaults that matter

If you omit them, the factory applies these defaults:

- `perPage` -> `10`
- `page` -> `1`

Only the adapter-specific payload is required:

- array paginator requires `items`
- model paginator requires `model`

## Important constraints

- The package only ships the two built-in adapter types above.
- Unsupported adapter names fail with `PaginatorException::adapterNotSupported(...)`.
- Missing required adapter parameters fail with `PaginatorException::missingRequiredParams(...)`.
- `Paginator` forwards calls to its adapter. Calling a method the adapter does not implement fails with `PaginatorException::methodNotSupported(...)`.
- Page numbers are not normalized. If you pass a page beyond the available range, the paginator keeps that page number and the current page data can be empty.

## Read next

- [Adapters](adapters.md)
- [Contracts](contracts.md)
- [Usage](usage.md)
