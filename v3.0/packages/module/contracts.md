# Module Contracts

## `ModuleLoader`

### `__construct()`

- resolves a filesystem service through `FileSystemFactory::get()`
- immediately registers merged module dependencies with the DI container

Treat construction as a boot step, not passive object creation.

### `loadModulesRoutes(): array<string, Closure>`

Returns route-definition closures keyed by module name.

Contract rules:

- reads module config lazily if it is not cached yet
- includes modules whose `enabled` option is truthy
- raises an exception when an enabled module has no `routes/routes.php`
- raises an exception when a route file returns something other than a `Closure`
- reuses cached route closures on later calls from the same loader instance

### `loadModulesDependencies(): array<string, string>`

Returns a merged dependency map for enabled modules.

Contract rules:

- includes modules whose `enabled` option is truthy
- missing dependency files are treated as empty
- non-array dependency files are treated as empty
- later modules override earlier dependency keys
- the loader instance reuses cached dependency data for each module

### `getModuleConfigs(): array`

Returns the raw `shared/config/modules.php` payload after loading it.

The returned array is cached on the loader instance, so a fresh loader is the cleanest way to pick up config edits made later in the same process.

## `ModuleManager`

### Constructor

```php
new ModuleManager(string $moduleName, string $template, bool $enabled, bool $withAssets = false)
```

Inputs:

- `moduleName` — directory name under `modules/` and config key in `shared/config/modules.php`
- `template` — template directory name under `src/Module/Templates`
- `enabled` — stored into generated module config
- `withAssets` — whether to also copy the template's `assets/` tree

### `writeContents(): void`

Creates the module directory when needed, copies the template, optionally copies assets, and verifies that copied files now exist.

Failure cases:

- template directory is missing
- assets were requested but the template has no assets directory
- template directory listing does not complete successfully
- any copied file is still missing after the copy step

### `addModuleConfig(): void`

Loads the current shared module config, checks for duplicate module names or prefixes, then rewrites `shared/config/modules.php` with the new entry added.

When `ModuleLoader` is not registered in the DI container yet, this method registers it before reading the current config.

The new module options are:

- `enabled` => constructor value
- `prefix` => `''` for `DemoWeb`, otherwise `strtolower($moduleName)`

### File rewrite behavior

`addModuleConfig()` rewrites the whole `shared/config/modules.php` file using exported PHP.

That means:

- existing formatting is not preserved
- the config file should keep returning a valid PHP array after each write

## Exceptions exposed by the package

`ModuleException` covers the main user-visible failures:

- module config file missing
- module route file missing
- template missing
- destination module directory missing during config registration
- duplicate module name or prefix
- directory listing failure
- incomplete file creation

Handle these exceptions at the point where you bootstrap or scaffold modules so startup and code generation issues surface clearly.
