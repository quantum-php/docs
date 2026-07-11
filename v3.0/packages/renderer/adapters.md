# Renderer Adapters

Renderer ships with two adapters that share the same view lookup rules but render templates differently.

## Configure the default adapter

The factory reads `view.default` when you do not pass an adapter name.

Conceptually, the config shape is:

```php
return [
    'default' => 'html',

    'html' => [
        // no built-in runtime options are consumed by the adapter
    ],

    'twig' => [
        // Twig environment options
    ],
];
```

The package passes `view.<adapter>` into the adapter constructor.

In the current starter project, the default config is:

- `view.default = 'html'`
- `view.twig` contains optional Twig environment settings

## HTML adapter

`HtmlAdapter` renders plain PHP view files.

Use it when your views are regular PHP templates and you want the lightest built-in option.

### How it renders

- resolves `<view>.php` from the module-first lookup path
- starts an output buffer
- extracts the provided params into local template variables
- `require`s the view file
- returns the buffered output as a string

### What to expect in templates

A render call like this:

```php
$renderer->render('posts/show', [
    'post' => $post,
    'title' => 'Post details',
]);
```

makes `$post` and `$title` available inside `posts/show.php`.

### Caveats

- Missing files throw a renderer exception.
- Parameter keys become PHP variables, so avoid keys that collide with names already used inside the template.
- The adapter accepts a config array but does not apply any built-in HTML-specific options during rendering.

## Twig adapter

`TwigAdapter` renders `.php` view files through Twig.

Use it when you want Twig syntax and Twig environment options while keeping Quantum's module/shared view lookup.

### How it renders

- resolves `<view>.php` from the same module-first lookup path
- points Twig's filesystem loader at the directory that contains that file
- creates a new Twig `Environment` for the render call
- passes the provided config array into Twig as environment options
- renders `<view>.php` with the given params

For the built-in adapter, top-level logical names such as `home` or `invoice` are the clearest fit. Those map directly to files such as `Views/home.php` and `Views/invoice.php`.

### Function exposure

Before rendering, the adapter registers every currently defined PHP function as a Twig function.

That means Twig templates can call framework helpers and other defined PHP functions directly, as long as they already exist in the current runtime.

### Caveats

- Twig templates still use `.php` filenames in this package.
- Missing files throw a renderer exception before Twig rendering starts.
- Twig loader, runtime, or syntax errors are surfaced by Twig.
- Each render call creates a fresh Twig environment, so register Twig options through config and treat per-render mutations as request-local.
- Nested logical names such as `posts/show` are a better fit for the HTML adapter. The built-in Twig adapter resolves the matched file's directory as the Twig loader root, so top-level Twig view names give the most predictable path resolution.

## Unsupported adapters

The factory supports `html` and `twig`.

Passing a different adapter name to `RendererFactory::get(...)` throws an adapter-not-supported exception.
