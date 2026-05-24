# Csrf Helpers

The package exposes two helpers.

## `csrf()`

```php
function csrf(): \Quantum\Csrf\Csrf
```

Behavior:

1. checks whether `Quantum\Csrf\Csrf` is registered in `Quantum\Di\Di`
2. registers it if missing
3. returns the container-managed instance

That means repeated `csrf()` calls in the same container return the same `Csrf` object.

Because that object uses session-backed storage, the important shared state is the active session token rather than object-local properties.

## `csrf_token()`

```php
function csrf_token(): ?string
```

This is the convenience helper for rendering tokens into forms or page output.

Behavior:

1. reads `APP_KEY` from the environment
2. throws an app exception if `APP_KEY` is missing
3. calls `csrf()->generateToken($appKey)`
4. returns the stored token

Use this helper when you want framework-default token generation without manually passing a key.
