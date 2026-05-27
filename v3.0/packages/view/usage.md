# View Usage

## Render a page with a layout

The normal page flow is:

1. set a layout
2. add any shared params
3. call `render()` for the page body
4. send the returned HTML in the response

```php
view()->setLayout('layouts/main', [
    'css' => ['/css/app.css'],
    'js' => ['/js/app.js'],
]);

view()->setParams([
    'title' => 'Settings',
    'user' => $user,
]);

$html = view()->render('pages/settings');
```

Use this path when the page should inherit the application's main layout and asset output.

## Render a fragment

Use `renderPartial()` or `partial()` for reusable fragments:

```php
$html = partial('partials/flash', [
    'message' => 'Profile saved.',
]);
```

This does not require `setLayout()`.

## Pass trusted HTML intentionally

By default, string params are escaped before rendering.

If you already trust a value and want to output it as HTML, mark it explicitly:

```php
view()->setParam('content', raw_param($trustedHtml));
```

Do this sparingly. Normal user input should stay in the default escaped path.

## Read data back inside layout or shared code

The shared param bag is readable:

```php
$title = view_param('title');
```

`getContent()` is useful in a layout wrapper after a full page render has already happened:

```php
$body = view()->getContent();
```

## Reset shared state when needed

Because `view()` returns a shared instance, params and layout asset definitions can carry over between calls.

Use `flushParams()` when you intentionally want to clear previously assigned values before another render path. When you are switching from a full page flow to a different layout flow, pair that with a fresh `setLayout()` call.

```php
view()->flushParams();
view()->setLayout('layouts/account', [
    'css' => ['/css/account.css'],
]);
```

## Common pitfalls

### Forgetting to set a layout

`render()` throws immediately when no layout is set.

If you only need a fragment, use `renderPartial()` instead.

### Expecting `getContent()` after a partial render

`renderPartial()` does not store page content for later retrieval.

### Passing mutable objects with strings you still need elsewhere

The escaping step updates object string properties before rendering. Pass arrays, DTO copies, or raw values if you need the original object unchanged.
