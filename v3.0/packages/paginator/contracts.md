# Paginator Contracts

## Factory contract

Create paginators through `Quantum\Paginator\Factories\PaginatorFactory::create(string $type, array $params)`.

The factory contract is strict:

- `$type` must be one of the built-in paginator types
- adapter-specific required parameters must be present
- `perPage` and `page` are optional because the factory injects defaults

Current required parameters are:

- `array` -> `items`
- `model` -> `model`

## Runtime API contract

The public wrapper is `Quantum\Paginator\Paginator`.

It guarantees these adapter methods:

- `data()`
- `firstItem()`
- `lastItem()`
- `currentPageNumber()`
- `previousPageNumber()`
- `nextPageNumber()`
- `lastPageNumber()`
- `currentPageLink()`
- `firstPageLink()`
- `previousPageLink()`
- `nextPageLink()`
- `lastPageLink()`
- `perPage()`
- `total()`
- `links()`
- `getPagination()`

## Page-number behavior

This package reports page numbers without clamping invalid input.

That leads to a few important edge cases:

- `currentPageNumber()` returns the page you passed in
- if you request a page beyond the last page, `data()` can be empty even though `currentPageNumber()` still reports that page
- on page `1`, `previousPageNumber()` returns `1`
- on the last page, `nextPageNumber()` returns the current page number instead of `null`

Those boundary values matter mostly when you call the page-number and page-link methods directly.

## Link-generation contract

Page links are derived from the current request URI.

The package:

- removes existing `page` and `per_page` query parameters
- keeps the rest of the current URI intact
- appends fresh `per_page=<value>&page=<value>` parameters
- prefixes the application base URL when `$withBaseUrl` is `true`

This makes pagination links request-aware. They are most useful during an active HTTP request.

## HTML output contract

`getPagination(bool $withBaseUrl = false, ?int $pageItemsCount = null)` returns:

- `null` when there is only one page or no pages
- a `<ul class="pagination">...</ul>` string when multiple pages exist

The generated HTML uses translation keys for the previous and next labels:

- `common.pagination.prev`
- `common.pagination.next`

If you rely on the built-in HTML output, make sure those translations exist in your loaded language files.

`$pageItemsCount` is normalized to a minimum of `3`, so smaller values do not reduce the visible page window below that threshold.

When you pass `true` to `getPagination()`, the numbered page links use absolute URLs. The previous, next, and jump-to-first links continue to use request-relative URLs, so use the direct link helpers when you need a fully absolute pagination bar.
