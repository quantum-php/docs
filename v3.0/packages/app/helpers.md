# App Helpers

The App package loads a small set of global helpers early in boot.

Use them for runtime paths and a few framework-level utility tasks.

## Path helpers

These helpers all depend on `App::getContext()` already being initialized.

### `base_dir()`

Returns the project root passed into `AppFactory::create()`.

### `logs_dir()`

Returns `<base>/logs`.

### `framework_dir()`

Returns `<base>/vendor/quantum/framework/src`.

Use it when you need the installed framework source tree, such as console command discovery.

### `modules_dir(?string $moduleDir = null)`

Returns the provided argument when one is supplied.

Otherwise it returns `<base>/modules`.

That makes it useful both for default module lookup and for callers that want to override the module root explicitly.

### `public_dir()`, `uploads_dir()`, `assets_dir()`, `hooks_dir()`

These resolve to:

- `<base>/public`
- `<base>/public/uploads`
- `<base>/public/assets`
- `<base>/hooks`

## File and class helpers

### `deleteDirectoryWithFiles(string $dir)`

Recursively deletes a directory and everything under it.

Use it carefully. This helper calls `unlink()` and `rmdir()` directly.

Behavior that matters:

- returns `false` when the path is not a directory
- returns the result of the final `rmdir()` call for real directories
- does not move anything to trash

### `get_directory_classes(string $path)`

Returns PHP filenames from a directory tree without namespaces.

Use it for simple discovery by class file name, not for fully qualified class resolution.

## Utility helpers

### `uuid_random()` and `uuid_ordered()`

- `uuid_random()` returns a UUID v4 string
- `uuid_ordered()` returns a UUID v1 string

### `slugify(string $text)`

Creates a lowercase dash-separated slug.

When the result would be empty or exactly `0`, it returns `n-a`.

### `random_number(int $length = 10)`

Builds a random numeric sequence and returns it as an integer.

Because the result is cast to `int`, this helper is not a good fit when leading zeroes must be preserved.

### `valid_base64(string $string)`

Returns `true` only when the string matches the package's base64 validation pattern and round-trips through `base64_decode(..., true)`.

### `is_debug_mode()`

Reads `config('app.debug')` and validates it as a boolean flag.

### `export($var)`

Exports a PHP value through Symfony VarExporter.

Use it when you need framework-generated PHP-safe value output instead of JSON.

## Internal helper

`_message()` is the package's placeholder-replacement helper for exception messages.

It is framework plumbing, not a typical application-level helper.
