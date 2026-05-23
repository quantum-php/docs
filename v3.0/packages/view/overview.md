# View

The View package is Quantum's page-level rendering layer.

Use it when you need more than a raw template render: layouts, shared view parameters, asset registration, page caching, and safe default escaping all live here.

## What the package provides

- `Quantum\View\View` for full-page and partial rendering
- `Quantum\View\Factories\ViewFactory` for resolving the shared view instance
- helper functions such as `view()`, `partial()`, and `view_param()`
- `RawParam` for explicitly unescaped values

## When to use it

Use the View package when your request should render a page inside a layout:

```php
view()->setLayout('layouts/main', [
    'css' => [
        '/css/app.css',
    ],
]);

$html = view()->render('pages/home', [
    'title' => 'Dashboard',
    'user' => $user,
]);
```

Use `renderPartial()` when you only need a fragment and do not want layout, asset, debugger, or cache behavior.

## Default rendering behavior

Before a value reaches the renderer, the package HTML-escapes every string parameter recursively.

That applies to:

- direct string params
- arrays containing strings
- object properties containing strings

If you need trusted HTML to pass through unchanged, wrap that value in `RawParam` or create it with `raw_param()`.

## Important constraints

- Full `render()` requires a layout. If no layout is set, it throws a `ViewException`.
- The factory returns a shared `View` instance, so params and layout state persist until you replace or clear them.
- `getContent()` only works after a successful full `render()`. Partial renders do not populate it.
- The package delegates template lookup and adapter selection to the Renderer package.

## Read next

- [Architecture](architecture.md)
- [Contracts](contracts.md)
- [Helpers](helpers.md)
- [Usage](usage.md)
