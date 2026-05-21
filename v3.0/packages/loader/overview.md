# Loader

The Loader package is Quantum's small file-loading utility.

Use it when you need to:

- load a PHP resource file from a module or shared directory
- check whether a module-specific file exists before falling back to shared resources
- include helper directories during bootstrap

Most applications use it indirectly through higher-level packages such as Config, Environment, and Storage uploads. Reach for it directly when you are building package-level resource loading of your own.

## Package shape

The package has two runtime classes:

- `Quantum\Loader\Setup` describes what file should be resolved
- `Quantum\Loader\Loader` resolves the path, checks existence, and `require`s the file

It also ships `LoaderException` for missing-file failures.

## What it loads

`Loader::load()` always loads a PHP file and returns whatever that file returns.

That makes it a good fit for resource files such as:

- config arrays
- package metadata arrays
- small PHP bootstrap resources

It is not a template renderer, JSON reader, or recursive filesystem scanner.

## Resolution model

A `Setup` object contains four values that affect file resolution:

- `pathPrefix` such as `config`
- `fileName` such as `database`
- `module` such as `Blog`
- `hierarchical` fallback flag

With `new Setup('config', 'database')`, the loader checks these locations in order:

1. `modules/<current-module>/config/database.php` when a current module is available
2. `shared/config/database.php` when hierarchical fallback is enabled

If no module is set, it goes straight to the shared path.

## Important constraints

- `Setup` defaults `hierarchical` to `true`, so shared fallback is on unless you disable it.
- `Setup` defaults the module to `request()->getCurrentModule()`, which means resolution depends on the current request context unless you set the module explicitly.
- `loadDir()` only includes `*.php` files from the exact directory pattern you pass in. It does not recurse into subdirectories.
- `loadDir()` uses `require_once`, while `load()` uses `require`. Repeated `load()` calls can re-run a file.
- Missing files raise `LoaderException` only when you call `load()` or `getFilePath()`. Use `fileExists()` when absence is expected.
