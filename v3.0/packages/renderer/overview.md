# Renderer

The Renderer package turns a view name plus data into an HTML string.

Use it when your controller, service, or response layer needs to render templates from either the current module or the shared `views` directory.

## What the package provides

The package is built from three small parts:

- `Quantum\Renderer\Factories\RendererFactory` resolves a renderer by adapter name
- `Quantum\Renderer\Renderer` is the wrapper you call from application code
- adapters implement `Quantum\Renderer\Contracts\TemplateRendererInterface`

Built-in adapter names:

- `html`
- `twig`

The starter project currently defaults to `html`.

Twig support is optional. The framework can resolve the `twig` adapter name, but the Twig package must also be installed in the project runtime before that adapter can be used successfully.

## How view lookup works

Both built-in adapters use the same lookup order for a view such as `posts/index`:

1. `modules/<CurrentModule>/Views/posts/index.php`
2. `shared/views/posts/index.php`

The current module comes from the active request.

That means module views override shared views automatically when both files exist.

## Default adapter behavior

If you do not request an adapter explicitly, the factory reads `view.default` from the framework view config.

The package imports that config lazily on first use, so most applications can start rendering without a manual setup step as long as `config/view.php` contains a valid default.

In the current starter project, `view.default` is `html`.

## Basic example

```php
use Quantum\Renderer\Factories\RendererFactory;

$renderer = RendererFactory::get();

$html = $renderer->render('posts/index', [
    'posts' => $posts,
    'title' => 'Latest posts',
]);
```

`render()` always returns a string.

## Important constraints

- View names are resolved to `.php` files for both built-in adapters.
- Unsupported adapter names fail immediately with a renderer exception.
- Missing view files fail immediately with a renderer exception.
- Renderer instances are cached per adapter name inside the factory service, so repeated `RendererFactory::get('twig')` calls reuse the same wrapper instance.
- The `html` adapter does not apply adapter config options during rendering.
- The `twig` adapter also requires the Twig package to be installed. If Twig is not available, adapter construction fails before rendering starts.

