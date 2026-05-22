# Renderer Usage

## Render with the configured default adapter

For most application code, resolve the default renderer and render a logical view name.

```php
use Quantum\Renderer\Factories\RendererFactory;

$renderer = RendererFactory::get();

return $renderer->render('home/index', [
    'title' => 'Dashboard',
    'user' => $user,
]);
```

If the current module contains `Views/home/index.php`, that file wins.

Otherwise the package falls back to `shared/views/home/index.php`.

## Pick an adapter explicitly

Use an explicit adapter when one code path must force PHP templates or Twig templates.

```php
$phpRenderer = RendererFactory::get('html');
$twigRenderer = RendererFactory::get('twig');
```

This creates separate cached renderer instances per adapter name.

## Write a PHP view for the HTML adapter

`HtmlAdapter` exposes params as local variables inside the template.

```php
// render call
$renderer->render('posts/show', [
    'post' => $post,
]);
```

```php
<!-- modules/Blog/Views/posts/show.php -->
<h1><?= htmlspecialchars($post->title) ?></h1>
```

Use the HTML adapter when you want direct PHP templates with no extra template engine layer.

## Write a Twig view

The Twig adapter still loads a `.php` file name, but the file contents should be Twig template syntax.

```php
$renderer = RendererFactory::get('twig');

echo $renderer->render('posts/show', [
    'post' => $post,
]);
```

```twig
{# modules/Blog/Views/posts/show.php #}
<h1>{{ post.title }}</h1>
```

If the Twig environment is configured correctly, the adapter renders that file through Twig.

## Use PHP functions in Twig templates

The Twig adapter registers all currently defined PHP functions as Twig functions.

That means helpers already loaded into the runtime can be called directly:

```twig
<p>{{ base_url() }}</p>
```

Use this carefully. It is convenient for framework helpers, but it also makes template behavior depend on which functions are already defined in the current process.

## Handle common failures

Wrap rendering when missing templates or unsupported adapters should become application-level errors.

```php
try {
    $html = RendererFactory::get()->render('emails/welcome', ['user' => $user]);
} catch (Throwable $e) {
    // log, fallback, or convert to an HTTP error
}
```

## Common pitfalls

### Do not include the `.php` suffix in the view name

Use `posts/show`, not `posts/show.php`.

The built-in adapters append `.php` themselves.

### Do not expect shared views to override module views

Lookup is module-first.

If a module file exists, the shared file with the same logical name is ignored.

### Know that HTML and Twig read the same file path convention

Switching from `html` to `twig` changes the rendering engine, not the filename convention.

The built-in Twig adapter still looks for `<view>.php`.
