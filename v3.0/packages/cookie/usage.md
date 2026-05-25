# Cookie Usage

## Read a cookie

```php
$userId = cookie()->get('user_id');
```

Use `has()` when the cookie is optional:

```php
if (cookie()->has('remember_token')) {
    $token = cookie()->get('remember_token');
}
```

Because presence checks treat empty values as missing, prefer non-empty strings or arrays for stored values.

## Write a cookie

```php
cookie()->set('remember_token', $token, 60 * 60 * 24 * 30, '/', '', true, true);
```

Arguments:

1. `key`
2. `value`
3. lifetime in seconds from now
4. cookie path
5. domain
6. `secure`
7. `httponly`

`time = 0` creates a session cookie instead of a persistent cookie.

## Store structured data

Cookie values are serialized before encryption, so arrays and other serializable values can round-trip through the API:

```php
cookie()->set('preferences', ['theme' => 'dark', 'compact' => true], 3600);

$preferences = cookie()->get('preferences');
```

Keep payloads small. This package does not add cookie size management or chunking.

## Delete one cookie or clear all cookies

```php
cookie()->delete('remember_token');
cookie()->flush();
```

`flush()` deletes every cookie currently visible in the wrapper.

## Integration notes

The package relies on Quantum encryption helpers under the hood. If encryption cannot encode or decode a value, the cookie call fails instead of falling back to plaintext.
