# Session Contracts

This package is small, but a few contracts are worth knowing before you build on it.

## Service contract

`Quantum\Session\Session` is a wrapper around one adapter that implements `SessionStorageInterface`.

```php
$session = session();
$adapter = $session->getAdapter();
```

The wrapper forwards supported method calls to the active adapter.

If you call a method the adapter does not implement, the wrapper throws a session exception.

## Read and write contract

### `set(string $key, mixed $value): void`

Stores the value under the given key.

### `get(string $key): mixed|null`

Returns the stored value when the key is considered present.

### `delete(string $key): void`

Removes the key when it exists.

### `all(): array`

Returns the current session storage as an array.

Both built-in adapters store values through `crypto_encode()` and read them back through `crypto_decode()`. In practice, application code should treat the Session API as the only supported read/write path.

## Presence contract

### `has(string $key): bool`

Presence is defined as:

- the key exists
- and the stored value is not empty

That means these values behave as missing:

- `null`
- `false`
- `0`
- `'0'`
- `''`

This matters because `get()` returns `null` whenever `has()` is false.

If your application needs to preserve empty-like values distinctly, store a non-empty wrapper value instead.

## Flash contract

### `setFlash(string $key, mixed $value)`

Stores a value for one later read.

### `getFlash(string $key): mixed|null`

Returns the value and deletes the key in the same call.

```php
session()->setFlash('notice', 'Saved');
$notice = session()->getFlash('notice'); // 'Saved'
$again = session()->getFlash('notice');  // null
```

Flash values are not tracked separately from normal keys. They become one-time values only because `getFlash()` deletes them after reading.

## Lifecycle contract

### `flush(): void`

Clears the adapter storage and calls `session_destroy()`.

### `getId(): ?string`

Returns the current PHP session ID, or `null` when no ID is available.

### `regenerateId(): bool`

- returns `false` when no PHP session is active
- calls `session_regenerate_id(true)` when the session is active
- closes and reinitializes the session after a successful regeneration

Use this after authentication or privilege changes.

## Factory contract

The factory resolves adapters by name from this fixed map:

- `native`
- `database`

Unknown adapter names fail during resolution.

The factory also caches one `Session` wrapper per adapter name inside the DI-managed factory service, so repeated `session('native')` calls reuse the same wrapper in the current process.