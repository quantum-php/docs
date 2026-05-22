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

Prefer backend setup through configuration, not direct adapter construction.
