# Asset Usage

This package is built around a simple flow: create `Asset` objects, register them with the manager, then render them where your layout needs them.

## Registering assets

```php
use Quantum\Asset\Asset;

asset()->registerAsset(new Asset(Asset::CSS, 'css/admin.css', 'admin'));
asset()->registerAsset(new Asset(Asset::JS, 'js/admin.js', 'admin-js', 5, ['defer']));
```

Use `registerAsset()` for one item or `register()` for a batch.

```php
asset()->register([
    new Asset(Asset::CSS, 'css/app.css', 'app'),
    new Asset(Asset::JS, 'https://cdn.example.com/alpine.min.js', 'alpine', 0, ['defer']),
]);
```

## Rendering asset tags

Render each type where it belongs in your template.

```php
<?php assets('css'); ?>
<?php assets('js'); ?>
```

`assets('css')` outputs `<link>` tags.

`assets('js')` outputs `<script>` tags.

The manager renders all registered assets for that type in ascending position order.

## Using explicit positions

Positions let you reserve exact slots.

```php
asset()->register([
    new Asset(Asset::JS, 'js/runtime.js', 'runtime', 0),
    new Asset(Asset::JS, 'js/vendor.js', 'vendor', 1),
    new Asset(Asset::JS, 'js/app.js', 'app'),
]);
```

In that example, `runtime` renders first, `vendor` second, and `app` is placed into the next free position.

Use this when a bundle or polyfill must load before the rest of your scripts.

## Looking up an asset by name

```php
$asset = asset()->get('app');

if ($asset !== null) {
    $url = $asset->url();
}
```

Name lookup is useful when a module wants to check whether a shared asset was already registered.

## Getting a URL without registering an asset

```php
$logoUrl = asset()->url('images/logo.svg');
$cdnUrl = asset()->url('https://cdn.example.com/logo.svg');
```

Use this when you only need the resolved public URL and not full tag rendering.

## Resetting the shared registry

```php
asset()->flush();
```

Call `flush()` when you need to clear previously registered assets from the shared manager instance, such as in long-running processes or isolated test setup.
