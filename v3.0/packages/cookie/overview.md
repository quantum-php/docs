# Cookie

Cookie provides a small encrypted wrapper around PHP cookies.

Use it when you want to read and write cookie values through Quantum instead of working with raw `$_COOKIE` and `setcookie(...)` calls.

## What it provides

- `Quantum\Cookie\Cookie` storage wrapper
- `cookie()` helper as the standard entry point
- automatic encryption on write and decryption on read

## Quick example

```php
cookie()->set('theme', 'dark', 3600, '/', '', true, true);

if (cookie()->has('theme')) {
    $theme = cookie()->get('theme');
}

cookie()->delete('theme');
```

## Operational constraints

- values are encrypted before they are written and decrypted when they are read
- `set()` stores the value in the current request storage immediately and also sends a `Set-Cookie` header
- `time` is treated as seconds from now; `0` creates a session cookie
- `has()` treats empty values as missing, so `''`, `0`, `'0'`, `false`, and `null` do not count as present
- `get()` depends on `has()`, so those values come back as `null`

## Read next

- [Usage](usage.md)
- [Contracts](contracts.md)
- [Helpers](helpers.md)
