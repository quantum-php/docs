# Views

Views are the part of the Quantum PHP Framework responsible for presenting output to the user.

In a typical web request, the controller gathers data, then hands that data to the view layer to render the final HTML.

## Core idea

A view is where presentation happens.

A simple web flow looks like this:

1. a route matches
2. a controller action runs
3. the controller prepares data for the page
4. the view renders that data into HTML
5. the response sends the final result

## Views are a first-class system in Quantum

From the upstream framework code, Quantum has an explicit `View` subsystem instead of treating views as raw file includes.

The view layer supports:

- layout rendering
- partial rendering
- view parameters
- asset registration
- view cache integration
- XSS filtering during rendering

That makes it a structured rendering system, not just template fragments.

## A layout must be set for full rendering

In Quantum's `View` class, full `render()` expects a layout to be set first.

That is why the upstream web controller template uses a `__before()` hook like this:

```php
public function __before(ViewFactory $view)
{
    $view->setLayout('layouts/main', [
        // assets...
    ]);
}
```

Then the action can render the page itself:

```php
public function index(ViewFactory $view): Response
{
    $view->setParams([
        'title' => config()->get('app.name'),
    ]);

    return response()->html($view->render('index'));
}
```

This is the basic Quantum pattern for web pages.

## View parameters

Quantum views can receive parameters before rendering.

The view layer supports methods such as:

- `setParam()`
- `setParams()`
- `getParam()`
- `getParams()`

This allows controllers to pass data into the template cleanly.

## Partial rendering

Quantum also supports partial rendering through `renderPartial()`.

That is useful for smaller reusable fragments that should not render through the full layout pipeline.

In practice, this helps keep page templates cleaner and more modular.

## Shared and module-specific views

From the project skeleton and module templates, Quantum supports both shared and module-specific view locations.

Shared project views exist under:

```text
shared/views/
```

Module templates place views under:

```text
modules/<ModuleName>/src/Views/
```

This is a practical split:

- shared views for project-wide or reusable rendering concerns
- module views for module-specific pages and UI pieces

## What module views look like

The upstream module templates include real view structure such as:

- `Views/layouts/main.php`
- `Views/pages/...`
- `Views/partials/...`
- page-level view files like `index.php`

That means a Quantum web module is designed to support:

- layouts
- pages
- partials
- reusable UI fragments

## Assets in the view layer

The upstream web controller template registers assets when setting the layout. That means view rendering and asset inclusion are intentionally connected.

### Asset manager contract

The `AssetManager` performs deterministic asset management and output:

- **Registration**: Assets are registered with an optional unique name. Attempting to register an asset with a name that already exists will throw an exception.
- **Publish Order**: Assets are published in a deterministic order:
    1. Explicitly prioritized assets (via `setPriorityAssets`) are rendered before regular assets.
    2. Regular assets (via `setRegularAssets`) are rendered into the first available free slot.
    3. Within those groups, assets are sorted by their defined type.
- **Output Separation**: Use `assets('css')` or `assets('js')` within your layout to retrieve and render the relevant asset group.
- **URL Prefixing**: All local asset paths are automatically prefixed with `/assets/` during output generation.

So a Quantum page is not just HTML content, it can also pull in CSS and JavaScript through the structured rendering flow.

## View caching

Quantum also includes view cache support.

Project-level view cache configuration lives in:

```text
shared/config/view_cache.php
```

From the framework code, if view cache is enabled, rendered layout output can be cached by route URI.

That means the view layer can participate directly in performance optimization.

## XSS filtering

The framework's `View` class applies XSS filtering to string parameters during rendering.

That matters because it shows Quantum is trying to make default rendering safer, not just more convenient.

## Renderer configuration

Project-level view renderer configuration lives in:

```text
shared/config/view.php
```

The project skeleton currently defines:

- a default renderer of `html`
- Twig-related configuration options as well

This suggests Quantum is designed to support more than one rendering mode, even if the default project uses the HTML renderer first.

## Practical view

A useful way to think about views in Quantum is:

- controllers prepare the data
- views render the presentation
- layouts wrap the page
- partials keep templates reusable
- assets and caching are part of the rendering system, not bolted on later

## What to read next

After views, continue with:

- [Modules](modules.md)
- [Routing](routing.md)
- [Controllers](controllers.md)
