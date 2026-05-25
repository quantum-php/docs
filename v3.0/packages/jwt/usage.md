# JWT Usage

Use `JwtToken` directly when you need explicit control over claims, signing key selection, and verification.

## Creating a token

```php
use Quantum\Jwt\JwtToken;

$token = (new JwtToken())
    ->setClaims([
        'iss' => 'https://api.example.com',
        'aud' => 'example-clients',
        'iat' => time(),
        'exp' => time() + 3600,
    ])
    ->setData([
        'id' => 15,
        'role' => 'admin',
    ])
    ->compose();
```

`setData()` always writes to the `data` claim. Use `setClaim()` or `setClaims()` for standard JWT claims such as `iss`, `nbf`, or `exp`.

## Using a custom signing key

```php
$token = (new JwtToken('custom-signing-secret'))
    ->setClaim('sub', 'user-15')
    ->compose();
```

If you do not pass a key, Quantum reads `APP_KEY` from the environment.

## Choosing an algorithm

```php
$jwt = (new JwtToken())
    ->setAlgorithm('HS512')
    ->setClaim('sub', 'user-15');

$token = $jwt->compose();
$payload = $jwt->retrieve($token)->fetchPayload();
```

Use the same algorithm for signing and verifying on that instance.

`setAlgorithm()` does not validate the string when you call it. If the algorithm is unsupported, the failure happens later when the token is encoded or decoded.

## Verifying a token and reading claims

```php
$payload = (new JwtToken())
    ->retrieve($token)
    ->fetchPayload();

$userData = (new JwtToken())
    ->retrieve($token)
    ->fetchData();

$subject = (new JwtToken())
    ->retrieve($token)
    ->fetchClaim('sub');
```

`fetchPayload()` returns the decoded payload object.

`fetchData()` only reads the `data` claim and casts it to an array. If the token has no `data` claim, it returns `null`.

`fetchClaim()` returns the raw claim value or `null` when the claim is absent.

`retrieve()` does not wrap upstream verification errors, so catch `firebase/php-jwt` exceptions where you handle untrusted tokens.

## Setting a key ID or custom header

```php
$token = (new JwtToken())
    ->setClaim('sub', 'user-15')
    ->compose('main-signing-key', ['typ' => 'JWT']);
```

Use this when downstream services expect a `kid` header or a custom header field.

## Working with leeway

```php
$payload = (new JwtToken())
    ->setLeeway(5)
    ->retrieve($token)
    ->fetchPayload();
```

Leeway is useful when tokens are validated across systems with small clock differences.

Be careful: this package forwards leeway to `Firebase\JWT\JWT::$leeway`, so the value is shared with later JWT verification in the same PHP process.

## Compose-time guard

```php
$token = (new JwtToken())->compose();
```

This fails with `JwtException::payloadNotFound()` because the package refuses to emit an empty token payload.

## Recommended usage pattern

Use a fresh `JwtToken` instance for each independent issue or verify flow.

The object keeps both pending compose claims and the last decoded payload on the same instance, so reusing one object across unrelated requests can preserve state you did not mean to carry forward.
