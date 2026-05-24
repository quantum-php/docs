# Cookie Contracts

## Public methods

```php
all(): array
has(string $key): bool
get(string $key)
set(string $key, $value = '', int $time = 0, string $path = '/', string $domain = '', bool $secure = false, bool $httponly = false): void
delete(string $key, string $path = '/'): void
flush(): void
```

## Read contract

### `all()`

Returns all currently stored cookies after decrypting each value.

Use it when you need the full cookie bag in application form instead of encrypted transport form.

### `has()`

Returns `true` only when the key exists and the stored value is not empty.

That means these values behave as absent:

- `''`
- `'0'`
- `0`
- `false`
- `null`

### `get()`

Returns the decrypted value for a present cookie.

Returns `null` when `has()` is false.

## Write contract

### `set()`

Writes the cookie in two places:

- updates the in-memory storage used by the current request
- schedules the outgoing browser cookie with `setcookie(...)`

The lifetime argument is relative, not absolute. Passing `3600` means "expire in one hour".

Values are serialized and encrypted before storage.

### `delete()`

Removes the key from in-memory storage and sends an expired cookie header when the cookie is considered present.

Deletion only exposes a `path` argument. Domain, secure, and HttpOnly flags are not repeated here.

### `flush()`

Deletes every cookie key currently available in the wrapper by calling `delete()` for each one.

## Failure behavior

`all()`, `get()`, and `set()` depend on encryption helpers. If encryption or decryption fails, the package surfaces that exception.

There is no plaintext fallback mode.
