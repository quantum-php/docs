# Session Helpers

## `session()`

```php
function session(?string $adapter = null): Session
```

Use this as the standard entry point for session operations.

```php
session()->set('locale', 'en');
$locale = session()->get('locale');
```

Pass an adapter name only when you explicitly need one:

```php
session('database')->set('cart_id', 'abc123');
```

## Helper behavior

- no adapter passed → uses `session.default`
- adapter passed → resolves that backend (`native` or `database`)
- returns a Session wrapper, not a raw adapter
- reuses the same wrapper for repeated calls to the same adapter in the current process

Prefer backend setup through configuration, then call `session()` from application code.
