# Paginator Usage

## Paginate an array

Use the array adapter when the full result set is already in memory.

```php
use Quantum\Paginator\Enums\PaginatorType;
use Quantum\Paginator\Factories\PaginatorFactory;

$paginator = PaginatorFactory::create(PaginatorType::ARRAY, [
    'items' => $users,
    'perPage' => 25,
    'page' => 1,
]);

return view('users/index', [
    'users' => $paginator->data(),
    'pagination' => $paginator->getPagination(),
]);
```

## Paginate a model query

Use the model adapter after you finish building the query.

```php
use Quantum\Paginator\Enums\PaginatorType;
use Quantum\Paginator\Factories\PaginatorFactory;

$postModel = $postModel
    ->criteria('status', '=', 'published')
    ->orderBy('id', 'desc');

$paginator = PaginatorFactory::create(PaginatorType::MODEL, [
    'model' => $postModel,
    'perPage' => 10,
    'page' => 2,
]);

$posts = $paginator->data();
```

The key rule is order of operations: prepare filters and sorting first, then create the paginator.

## Read navigation metadata

The same calls work for both adapters.

```php
$currentPage = $paginator->currentPageNumber();
$lastPage = $paginator->lastPageNumber();
$total = $paginator->total();
$links = $paginator->links();
```

Use this when you want to render your own pagination UI instead of the built-in HTML.

## Generate relative or absolute links

By default, link methods return request-relative URLs.

```php
$current = $paginator->currentPageLink();
$next = $paginator->nextPageLink();
```

Pass `true` when you need links prefixed with the application base URL.

```php
$absoluteLinks = $paginator->links(true);
```

## Use the built-in HTML renderer

`getPagination()` returns a ready-to-render `<ul>` only when there is more than one page.

```php
$pagination = $paginator->getPagination();

if ($pagination !== null) {
    echo $pagination;
}
```

You can also control the visible page window size.

```php
echo $paginator->getPagination(false, 5);
```

Values below `3` are treated as `3`.

## Common pitfalls

### Do not expect automatic page correction

If the requested page is outside the available range, the paginator does not snap it back to the first or last page for you.

Handle that at the request-validation or controller level if your application needs strict bounds.

### Know the boundary link behavior

Direct page-link helpers mirror the page-number methods.

That means:

- `previousPageLink()` on page `1` points to page `1`
- `nextPageLink()` on the last page points to the last page

The built-in HTML renderer avoids showing previous and next buttons at those boundaries, but direct helper calls still return those links.

### Use built-in HTML only in request-aware contexts

Pagination URLs come from the current request URI. If there is no meaningful request context, generate your own links instead of relying on `getPagination()` or the page-link helpers.
