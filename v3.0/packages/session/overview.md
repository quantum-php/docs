# Session

The Session package gives Quantum one consistent API for request-scoped state, flash messages, and session ID management.

Use it when you need to persist data between requests without binding your application code to PHP's raw `$_SESSION` array or to one storage backend.

## When to use it

Reach for Session when you want to:

- store authenticated user state or small workflow state between requests
- show one-time flash messages after redirects
- switch between PHP native session storage and a database-backed session store
- regenerate the session ID after login or other privilege changes

## Package shape

The package is built from a few small parts:

- `Quantum\Session\Session` is the wrapper your application code calls
- `Quantum\Session\Factories\SessionFactory` resolves and caches one session wrapper per adapter name
- adapters implement `Quantum\Session\Contracts\SessionStorageInterface`
- the global `session()` helper resolves the shared wrapper

## Adapter model

Session supports two adapter names:

- `native`
- `database`

If you do not pass an adapter name, the factory loads `config/session.php` and uses `session.default`.

Each adapter receives its own config block from `session.<adapter-name>`.

## Common operations

The wrapper exposes the same core operations for both adapters:

- `all()`
- `has(string $key)`
- `get(string $key)`
- `set(string $key, mixed $value)`
- `getFlash(string $key)`
- `setFlash(string $key, mixed $value)`
- `delete(string $key)`
- `flush()`
- `getId()`
- `regenerateId()`

```php
session()->set('user_id', 42);

if (session()->has('user_id')) {
    $userId = session()->get('user_id');
}

session()->setFlash('status', 'Profile updated');
```

## Important constraints

A few behaviors affect real usage:

- `SessionFactory` caches one `Session` instance per adapter name inside the factory service
- unsupported method calls fail on the wrapper instead of silently passing through
- `has()` uses a non-empty check, so values like `0`, `false`, `''`, and `null` behave as missing
- `get()` depends on `has()`, so those same empty-like values come back as `null`
- values are written through the framework crypto helpers, so read them back through the Session API rather than assuming raw storage format

For backend-specific behavior, see [Adapters](adapters.md).