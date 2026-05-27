# Using Sessions

Use `session()` as the default API.

## Store and read values

```php
session()->set('user.id', 42);
session()->set('user.name', 'Jane');

$userId = session()->get('user.id');
$all = session()->all();
```

Remove values when needed:

```php
session()->delete('user.name');
session()->flush();
```

## Use flash messages for one-time feedback

```php
session()->setFlash('status', 'Post created');

// next request
$status = session()->getFlash('status');
```

`getFlash()` reads and deletes in one call.

## Regenerate session ID after login

```php
if ($authenticated) {
    session()->regenerateId();
    session()->set('user_id', $user->id);
}
```

## Pick backend explicitly only when necessary

```php
$nativeSession = session('native');
$databaseSession = session('database');
```

Most apps should set `session.default` and call `session()` without args.

## Common pitfalls

- `has()` returns `false` for empty-like values (`0`, `false`, `''`, `null`).
- Native adapter includes framework keys like `LAST_ACTIVITY` in `all()` output.
- Session values are encrypted in storage, so inspect them through `session()->get()` or `session()->all()` when you need app-level values.
- Database adapter works best after the database connection, model layer, and session table are ready.
