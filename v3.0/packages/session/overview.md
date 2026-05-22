# Session

Session provides a consistent API for request-scoped state, flash messages, and session ID management.

Use it when you need to persist small values between requests without coupling your code to raw `$_SESSION` access.

## What it provides

- `Quantum\Session\Session` wrapper
- `session()` helper as the standard entry point
- adapter selection via config (`native` or `database`)

## Quick example

```php
session()->set('user_id', 42);

if (session()->has('user_id')) {
    $userId = session()->get('user_id');
}

session()->setFlash('status', 'Profile updated');
```

## Adapter model

Supported adapter names:

- `native`
- `database`

When no adapter is passed, Session uses `session.default` from `config/session.php`.

## Operational constraints

- `has()` treats empty-like values as missing (`null`, `false`, `0`, `'0'`, `''`).
- `get()` depends on `has()`, so those values resolve as `null`.
- Use Session APIs for reads/writes instead of relying on backend storage format.
- Regenerate session IDs after authentication or privilege changes.

## Read next

- [Usage](usage.md)
- [Contracts](contracts.md)
- [Helpers](helpers.md)
- [Adapters](adapters.md)
