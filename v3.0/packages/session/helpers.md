# Session Helpers

The package exposes one global resolver helper.

## `session()`

```php
function session(?string $adapter = null): Session
```

Use this as the normal entry point for session work.

```php
session()->set('locale', 'en');
$locale = session()->get('locale');
```

Pass an adapter name when you need a specific backend:

```php
session('database')->set('cart_id', 'abc123');
```

## Helper behavior

A few helper details matter in real apps:

- `session()` resolves through `SessionFactory::get()`
- the first call loads `config/session.php` when the config has not been imported yet
- when no adapter is passed, the helper uses `session.default`
- repeated calls reuse the cached wrapper for that adapter name inside the current process

Because the helper returns the wrapper, not the raw adapter, backend-specific setup should happen through configuration rather than direct adapter construction.