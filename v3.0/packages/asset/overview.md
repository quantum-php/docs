# Asset

Asset manages CSS and JavaScript tags for your views from one shared registry.

Use it when you want to register frontend files in controllers, services, or modules and render them later in a layout.

## What it provides

- `Asset` value objects for individual CSS or JavaScript entries
- `AssetManager` for registration, lookup, URL generation, and output
- `asset()` helper for the shared manager instance
- `assets('css')` and `assets('js')` helpers for rendering tags

## Quick example

```php
use Quantum\Asset\Asset;

asset()->register([
    new Asset(Asset::CSS, 'css/app.css', 'app'),
    new Asset(Asset::JS, 'js/app.js', 'app', 10, ['defer']),
]);
```

In your layout:

```php
<head>
    <?php assets('css'); ?>
</head>
<body>
    <?php assets('js'); ?>
</body>
```

## How paths work

Relative paths are published under `base_url() . '/assets/'`.

That means `css/app.css` becomes something like `/assets/css/app.css`.

Absolute URLs keep their original value, so CDN links can be registered directly.

## When to use positions

Use the optional position argument when load order matters.

Lower positions render first inside the same asset type. Assets without an explicit position are placed into the next free slot after positioned entries are reserved.

## Operational constraints

- Asset names must be unique when you provide them.
- CSS and JavaScript are rendered separately.
- The helper returns one shared manager instance for the current process, so registered assets stay in memory until you flush them.
- `assets()` only accepts the built-in type keys: `css` and `js`.

## Read next

- [Usage](usage.md)
- [Contracts](contracts.md)
- [Helpers](helpers.md)
- [Architecture](architecture.md)
