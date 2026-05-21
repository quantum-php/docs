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
- missing route files stop loading with an exception
- each module route file must return a closure, not an array or other value

## Read module dependencies

```php
use Quantum\Module\ModuleLoader;

$loader = new ModuleLoader();
$dependencies = $loader->loadModulesDependencies();
```

This returns one merged dependency map across all configured modules.

Use `getModuleDependencies('Blog')` when you only need the bindings declared by one module.

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

If you call `addModuleConfig()` before the module directory exists, the package throws `missingModuleDirectory()` and does not touch `shared/config/modules.php`.

## Choose templates carefully

Use a template name that exists under `src/Module/Templates`.

Examples available in the package:

- `DefaultApi`
- `DefaultWeb`
- `DemoApi`
- `DemoWeb`
- `Toolkit`

If the template directory is missing, module generation fails before any files are copied.

## Copy assets only when the template has them

`withAssets` makes the manager copy `Templates/<Template>/assets` into `assets/<ModuleName>`.

That is useful for web-facing templates such as `DefaultWeb`, `DemoWeb`, or `Toolkit`.

For templates without an `assets` directory, enabling `withAssets` causes generation to fail.

## Handle duplicate names and prefixes

`addModuleConfig()` rejects a new module when either of these already exists in `shared/config/modules.php`:

- the same module name
- an existing `prefix` that matches the new module's lowercase name

This prevents two modules from registering the same config key or default prefix.

## Common pitfalls

- `ModuleLoader` registers dependencies in its constructor, so simply instantiating it has side effects.
- Disabled modules still contribute dependency bindings.
- `writeContents()` does not update module config by itself.
- `addModuleConfig()` does not create files by itself.
- Generated PHP files use the current module base namespace from `request()`, so generation should run in the same environment your project expects.
