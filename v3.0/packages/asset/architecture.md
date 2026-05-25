# Asset Architecture

Asset is a small registry package with three moving parts.

## `Asset`

`Asset` is the value object for one frontend file.

It stores:

- type (`CSS` or `JS`)
- path
- optional unique name
- optional position
- optional HTML attributes

It can also resolve its public URL and render its own HTML tag.

## `AssetManager`

`AssetManager` is the package entry point.

It keeps an in-memory store of registered assets, organizes them by type and position, and outputs rendered tags on demand.

The manager does not write files or publish assets to disk. It only tracks metadata and turns that metadata into HTML output.

## Global helpers

The helpers connect the package to the rest of the framework:

- `asset()` resolves the shared manager instance from DI
- `assets($type)` renders one asset type directly

This design makes the package easy to call from plain PHP templates without passing the manager through every layer manually.

## Lifecycle to keep in mind

1. Create one or more `Asset` objects.
2. Register them with the shared manager.
3. Render `css` or `js` output where needed.
4. Optionally call `flush()` if you need a clean registry afterward.

Because the manager is shared, lifecycle discipline matters more in tests, CLI scripts, or any long-running process than in short-lived PHP-FPM requests.
