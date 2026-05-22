# Using Sessions

This package is usually used through the `session()` helper.

## Store and read values

```php
session()->set('user.id', 42);
session()->set('user.name', 'Jane');

$userId = session()->get('user.id');
$all = session()->all();
```

Use `delete()` when you want to remove one key and `flush()` when you want to destroy the whole session.

```php
session()->delete('user.name');
session()->flush();
```

## Show flash messages after redirects

Flash values are just normal session entries that delete themselves when read through `getFlash()`.

```php
session()->setFlash('status', 'Post created');

// next request
$status = session()->getFlash('status');
```

If you call `get()` instead of `getFlash()`, the value stays in the session.

## Regenerate the session ID after login

```php
if ($authenticated) {
    session()->regenerateId();
    session()->set('user_id', $user->id);
}
```

This is the right time to rotate the session ID and reduce fixation risk.

## Pick a backend explicitly

```php
$nativeSession = session('native');
$databaseSession = session('database');
```

Use this only when your application genuinely needs different session backends. Most apps should configure `session.default` and call `session()` without arguments.

## Practical caveats

Keep these in mind while integrating:

- avoid using empty-like values when you need `has()` checks to succeed
- the native adapter adds `LAST_ACTIVITY` to the session data, so `all()` is not just your application keys there
- the database adapter requires a compatible table and working database/model setup before the first request reaches it
- backend switching changes storage location, not the public API

For backend-specific setup, see [Adapters](adapters.md).