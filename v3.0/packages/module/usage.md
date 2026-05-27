# Module Usage

## Load enabled module routes

Use `ModuleLoader` when you need the route closures for the modules currently enabled in `shared/config/modules.php`.

```php
use Quantum\Module\ModuleLoader;

$loader = new ModuleLoader();
$routes = $loader->loadModulesRoutes();

foreach ($routes as $module => $defineRoutes) {
    $defineRoutes();
}
```

What to expect:

- disabled modules are skipped
- enabled modules without a route file raise an exception during loading
- each module route file returns a closure rather than an array or other value

For development tooling or long-lived processes, use a fresh `ModuleLoader` after editing module config, dependency files, or route files so the next read uses the updated definitions.

## Read module dependencies

```php
use Quantum\Module\ModuleLoader;

$loader = new ModuleLoader();
$dependencies = $loader->loadModulesDependencies();
```

This returns one merged dependency map across all configured modules.

Use `getModuleDependencies('Blog')` when you need the bindings declared by one module.

## Scaffold a new module

```php
use Quantum\Module\ModuleManager;

$manager = new ModuleManager(
    moduleName: 'Blog',
    template: 'DefaultWeb',
    enabled: true,
    withAssets: true,
);

$manager->writeContents();
$manager->addModuleConfig();
```

Recommended order:

1. call `writeContents()` first so the module directory exists
2. call `addModuleConfig()` after files are created

If you call `addModuleConfig()` before the module directory exists, the package raises `missingModuleDirectory()` and leaves `shared/config/modules.php` unchanged.

## Choose templates carefully

Use a template name that exists under `src/Module/Templates`.

Examples available in the package:

- `DefaultApi`
- `DefaultWeb`
- `DemoApi`
- `DemoWeb`
- `Toolkit`

If the template directory is missing, module generation stops before any files are copied.

## Copy assets when the template ships an assets directory

`withAssets` makes the manager copy `Templates/<Template>/assets` into `assets/<ModuleName>`.

That is useful for web-facing templates such as `DefaultWeb`, `DemoWeb`, or `Toolkit`.

When a template has no `assets` directory, leave `withAssets` set to `false`.

## Handle duplicate names and prefixes

`addModuleConfig()` rejects a new module when either of these already exists in `shared/config/modules.php`:

- the same module name
- an existing `prefix` that matches the new module's lowercase name

This prevents two modules from registering the same config key or default prefix.

## Common reminders

- `ModuleLoader` registers dependencies in its constructor, so instantiating it also updates the DI container.
- Disabled modules still contribute dependency bindings.
- `writeContents()` covers filesystem scaffolding, while `addModuleConfig()` updates `shared/config/modules.php`.
- Generated files in a template's `src/` tree receive placeholder replacement, and generated PHP files use the current module base namespace from `request()`.
