# Asset Helpers

The package exposes two global helpers for common view-layer work.

## `asset()`

```php
$manager = asset();
```

Returns the shared `Quantum\Asset\AssetManager` instance.

Use it to:

- register assets
- look up named assets
- resolve URLs
- clear the registry with `flush()`

Because the manager is shared through DI, repeated calls return the same instance during the current process.

## `assets(string $type)`

```php
assets('css');
assets('js');
```

Renders all registered assets for the requested type.

Use `css` for stylesheet tags and `js` for script tags.

This helper echoes markup directly, so call it from a template, layout, or another output-producing layer.

## Practical pattern

A common pattern is to register assets during request handling and render them once in the base layout.

```php
// controller or middleware
asset()->registerAsset(new Asset(Asset::CSS, 'css/dashboard.css', 'dashboard'));

// layout
<?php assets('css'); ?>
```

That keeps asset decisions close to the feature that needs them without hardcoding every tag in the layout.
