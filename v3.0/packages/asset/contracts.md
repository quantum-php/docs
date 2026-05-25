# Asset Contracts

This page summarizes the behavior you can rely on when integrating Asset.

## Supported asset types

The package supports two built-in asset types:

- `Asset::CSS`
- `Asset::JS`

The rendering helpers map those to string keys:

- `css`
- `js`

## Path resolution contract

`Asset::url()` and `AssetManager::url()` behave the same way:

- if the path has a host, it is returned unchanged
- otherwise the path is prefixed with `base_url() . '/assets/'`

This package does not normalize slashes for you. Pass paths that already match your public `assets` directory structure.

## Registration contract

You can register assets individually or in batches.

```php
asset()->registerAsset($asset);
asset()->register([$asset1, $asset2]);
```

When an asset has a name, that name must be unique across the manager store.

Registering another named asset with the same name throws an `AssetException`.

Unnamed assets are allowed and can be repeated.

## Ordering contract

Each asset carries a `position` integer.

- `-1` means no explicit position
- any other integer reserves an exact slot inside its own type group

CSS and JavaScript are ordered independently.

When rendering:

- explicitly positioned assets are placed first into their requested slots
- if two assets of the same type claim the same position, registration succeeds but rendering throws an `AssetException`
- unpositioned assets are assigned to the next free slot starting from `0`
- final output is sorted by slot number in ascending order

## Rendering contract

`assets('css')` and `assets('js')` echo output directly.

They do not return strings.

Rendered tags include a trailing newline after each asset.

Template behavior differs slightly by type:

- CSS renders `<link rel="stylesheet" type="text/css" href="...">`
- JavaScript renders `<script src="..." ...></script>`

JavaScript attributes are joined with spaces and inserted into the tag.

CSS attributes passed to `Asset` are not rendered.

## Shared-instance contract

`asset()` returns a DI-backed shared `AssetManager` instance.

That means registrations, lookups, and flushes all operate on the same manager instance inside the current process.

## Failure contract

Expect `AssetException` for:

- duplicate asset names
- duplicate render positions within the same asset type

Expect a PHP error if `assets()` is called with an unsupported string key, because the helper indexes the built-in type map directly.
