# Config Contracts

This page covers the behavior other code can rely on when using `Quantum\Config\Config`.

## Load contract

```php
$config->load($setup);
```

- expects a `Quantum\Config\Setup`
- loads one PHP file resolved from the `Setup`
- stores the returned array as the root config payload
- does nothing if the store has already been loaded once

Use `load()` when you control the whole store shape.

## Import contract

```php
$config->import($setup);
```

- expects a `Quantum\Config\Setup`
- reads the setup filename and uses it as the top-level key
- stores the loaded payload as `[$fileName => $data]`
- throws `ConfigException` if that truthy top-level key already exists

Because the imported data is always namespaced by filename, the usual access pattern is:

```php
config()->import(new Setup('config', 'database'));

$driver = config()->get('database.default');
```

### Filename caveat

The package only performs collision checks when the setup filename is truthy.

In practice, treat a non-empty filename as required for `import()`. It gives you predictable access paths and the intended collision guard.

## Optional import contract

```php
$config->importIfExists($setup): bool
```

- returns `false` and changes nothing when the file cannot be resolved
- otherwise behaves like `import()`, including the collision check, and returns `true`

## Read contract

### `get(string $key, $default = null)`

- returns the stored value when the key exists
- returns the provided default when the key is missing

Keys use dot notation because the backing store is a dot-accessible data container.

### `has(string $key): bool`

- returns `true` when the key exists in the current store
- returns `false` when the store is empty or the key is missing

### `all(): ?Data`

- returns the whole data container
- returns `null` before anything has been loaded, imported, or set

## Typed reader contract

`getBool()` and `getInt()` read through `get()`. For how to use them, see [Reading booleans and numbers](usage.md#reading-booleans-and-numbers).

```php
public function getBool(string $key, bool $default = false): bool;
public function getInt(string $key, int $default = 0): int;
```

- a missing key, or a key whose value is `null`, returns the default
- `getBool()` returns `true` for `true`, `1`, `on` and `yes`, ignoring letter case, and `false` for every other value, including `false`, `0`, `off`, `no` and an empty value
- `getInt()` returns the number for a whole number or whole-number text such as `587`, and throws `ConfigException::invalidValue()` for any other value, such as `abc`, `1.5` or an empty value
- `get()` is not affected and keeps returning the raw value

The methods belong to the `Config` class. `ConfigInterface` does not declare them, so code that depends on the interface alone cannot call them.

## Write contract

### `set(string $key, $value): void`

- creates the store if needed
- writes or overwrites the value at the given key

### `delete(string $key): void`

- removes the key when it exists
- does nothing when the store is empty or the key is missing

### `flush(): void`

- clears the entire in-memory store
- makes `all()` return `null` again
- allows a later `load()` call to run again

## Failure behavior

- a missing file in `load()` or `import()` raises `ConfigException` with the `Setup` exception message (by default ``File `<pathPrefix>/<fileName>` not found!``)
- duplicate imported section names raise `ConfigException`
- `getInt()` raises `ConfigException::invalidValue()` for a value that is not a whole number
- helper resolution can fail if DI registration or resolution fails
