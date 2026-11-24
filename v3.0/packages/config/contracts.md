# Config Contracts

This page covers the behavior other code can rely on when using `Quantum\Config\Config` and `Quantum\Config\ConfigSection`.

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

- returns the stored value when the key exists, `null` and empty text included
- returns the provided default only when the key is missing

Keys use dot notation because the backing store is a dot-accessible data container.

### `has(string $key): bool`

- returns `true` when the key exists in the current store
- returns `false` when the store is empty or the key is missing

### `all(): array`

- returns all values as an array, a copy: changing it does not change the config
- returns `[]` before anything has been loaded, imported, or set

### `section(string $key): ConfigSection`

- returns the values under the key as a new `ConfigSection`, described in the [section contract](#section-contract)

## Typed reader contract

`getBool()` and `getInt()` read through `get()`. For how to use them, see [Reading booleans and numbers](usage.md#reading-booleans-and-numbers).

```php
public function getBool(string $key, ?bool $default = null): bool;
public function getInt(string $key, ?int $default = null): int;
```

- a key that is missing, `null`, or empty text (such as `KEY=` in `.env`) is not set
- a key that is not set returns the default when one is passed, and throws `ConfigException::missingKey()` ("The config key `x` is missing.") when none is passed, so a reader without a default states a required key
- `getBool()` returns `true` for `true`, `1`, `on` and `yes`, ignoring letter case, and `false` for every other value, including `false`, `0`, `off` and `no`
- `getInt()` returns the number for a whole number or whole-number text such as `587`, and throws `ConfigException::invalidValue()` for any other value, such as `abc` or `1.5`
- `get()` is not affected and keeps returning the raw value

`Config` and `ConfigSection` both have these methods. `ConfigInterface` does not declare them, so code that depends on the interface alone cannot call them.

## Section contract

`Quantum\Config\ConfigSection` is the read-only part of the config that adapters receive. `config()->section('cache.redis')` returns one, and `new ConfigSection([...])` builds one from an array:

```php
use Quantum\Config\ConfigSection;

$section = new ConfigSection(['host' => '127.0.0.1', 'port' => '6379']);

$section->getInt('port'); // 6379
```

- it has `get()`, `has()`, `all()`, `section()`, `getBool()` and `getInt()`, with the rules above
- it has no `load()`, `import()`, `set()`, `delete()` or `flush()`, and the class is `final`
- `section()` gives an empty section when the key is missing or its value is not an array
- a section keeps the values it was created with: later changes to the config do not reach it
- arrays are copied, so a section and the arrays it returns never change each other
- objects stored in the config, such as closures or services, are not cloned: they are shared

## Write contract

### `set(string $key, $value): void`

- creates the store if needed
- writes or overwrites the value at the given key; a dotted key such as `cache.redis` nests the value

### `delete(string $key): void`

- removes the key when it exists
- does nothing when the store is empty or the key is missing

### `flush(): void`

- clears the entire in-memory store
- makes `all()` return `[]` again
- allows a later `load()` call to run again

## Failure behavior

- a missing file in `load()` or `import()` raises `ConfigException` with the `Setup` exception message (by default ``File `<pathPrefix>/<fileName>` not found!``)
- duplicate imported section names raise `ConfigException`
- `getInt()` raises `ConfigException::invalidValue()` for a value that is not a whole number
- `getBool()` and `getInt()` without a default raise `ConfigException::missingKey()` for a key that is not set
- helper resolution can fail if DI registration or resolution fails
