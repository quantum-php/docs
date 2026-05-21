# Loader Usage

## Load a shared config file

For a normal shared config file, create a setup object and load it:

```php
use Quantum\Loader\Loader;
use Quantum\Loader\Setup;

$loader = new Loader();

$config = $loader
    ->setup(new Setup('config', 'database'))
    ->load();
```

With default hierarchical behavior, resolution is:

1. `modules/<current-module>/config/database.php` (if a current module exists)
2. `config/database.php` (primary path)
3. `shared/config/database.php` (fallback)

If your project keeps config under `shared/config`, Loader reaches it through step 3.

## Prefer `fileExists()` when the file is optional

If a package can work without a file, check first:

```php
$setup = new Setup('config', 'uploads');
$loader = new Loader();
$loader->setup($setup);

if ($loader->fileExists()) {
    $uploads = $loader->load();
}
```

This is the pattern Quantum uses for optional uploads configuration.

## Load a module override before shared fallback

To let a module override a shared resource, keep hierarchical loading enabled and set the module explicitly when needed:

```php
$setup = new Setup('config', 'auth', true, 'Admin');

$config = (new Loader())
    ->setup($setup)
    ->load();
```

Resolution order is:

1. `modules/Admin/config/auth.php`
2. `shared/config/auth.php`

## Disable shared fallback for module-only files

If a file must exist only inside a module, turn hierarchy off:

```php
$setup = new Setup('views', 'dashboard', false, 'Admin');

$loader = new Loader();
$loader->setup($setup);

if (!$loader->fileExists()) {
    // handle the missing module file yourself
}
```

With `hierarchical` set to `false`, the loader does not look under `shared/`.

## Customize the error message

`getFilePath()` and `load()` use the exception message stored in `Setup`:

```php
$setup = new Setup(
    'config',
    'mailer',
    true,
    null,
    'Mailer configuration is missing.'
);

$config = (new Loader())
    ->setup($setup)
    ->load();
```

Use this when a generic `File `config/mailer` not found!` message is too low-level for your package.

## Load helper directories during bootstrap

Use `loadDir()` when you want every PHP helper file in one directory pattern to be included:

```php
$loader = new Loader();
$loader->loadDir(base_dir() . DS . 'helpers');
$loader->loadDir(base_dir() . DS . 'modules' . DS . '*' . DS . 'helpers');
```

A few caveats matter here:

- only `*.php` files are included
- subdirectories are ignored
- files are included with `require_once`
- `Setup` is not used for directory loading

## Practical caveats

- Shared fallback lowercases `pathPrefix`; module/primary paths use the value as provided. Use consistent lowercase directory names to avoid case-related surprises across environments.
- `load()` returns whatever the target PHP file returns. If the file returns nothing, you get PHP's normal `require` return value.
- Reuse a `Setup` object only when you want the same resolution rules. It is mutable and can be changed after construction.
- Reuse a DI-managed `Loader` carefully. Always call `setup()` again before each new load.
