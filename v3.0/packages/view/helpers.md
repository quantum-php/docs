# View Helpers

The package exposes a small helper layer for rendering and view-related convenience tasks.

## `view()`

```php
function view(): View
```

Use this as the normal entry point.

```php
view()->setLayout('layouts/main');
```

Behavior:

- resolves the View service through `ViewFactory::get()`
- returns the shared `View` instance for the current DI container

Because the instance is shared, helper calls see the same layout and param state.

## `partial()`

```php
function partial(string $partial, array $args = []): string
```

This is a shortcut for `view()->renderPartial()`.

```php
$card = partial('partials/user-card', ['user' => $user]);
```

Use it when you need a fragment without the full page pipeline.

## `view_param()`

```php
function view_param(string $key)
```

Reads one value from the current view param bag.

If the key does not exist, it returns `null`.

## `raw_param()`

```php
function raw_param($value): RawParam
```

Creates a `RawParam` wrapper for trusted content.

```php
view()->setParam('body', raw_param($trustedHtml));
```

Prefer this when a value should stay unescaped but you do not want to call `setRawParam()` directly.

## `markdown_to_html()`

```php
function markdown_to_html(string $content, bool $sanitize = false): string
```

Converts Markdown to HTML with `league/commonmark`.

```php
$html = markdown_to_html($markdown);
$safeHtml = markdown_to_html($markdown, true);
```

Contract:

- always converts Markdown first
- when `$sanitize` is `false`, returns the converted HTML as-is
- when `$sanitize` is `true`, runs the converted HTML through HTML Purifier before returning it

Important caveat:

- sanitizing is opt-in, not the default
- this helper is independent from the View package's param escaping pipeline
