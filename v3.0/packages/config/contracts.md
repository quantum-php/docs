# Config Contracts

This page covers the behavior other code can rely on when using `Quantum\Config\Config`.

## Load contract

```php
$config->load($setup);
```

- expects a `Quantum\Loader\Setup`
- loads one PHP file through `Loader`
- stores the returned array as the root config payload
- does nothing if the store has already been loaded once

Use `load()` when you control the whole store shape.

## Import contract

```php
$config->import($setup);
```

- expects a `Quantum\Loader\Setup`
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

- missing files and loader resolution problems bubble up from `Loader`
- duplicate imported section names raise `ConfigException`
- helper resolution can fail if DI registration or resolution fails
