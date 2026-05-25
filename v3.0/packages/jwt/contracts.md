# JWT Contracts

This page covers the runtime behaviors you can rely on when integrating with `Quantum\Jwt\JwtToken`.

## Construction contract

```php
use Quantum\Jwt\JwtToken;

$jwt = new JwtToken();
$custom = new JwtToken('signing-secret');
```

Behavior:

- without an argument, the constructor reads `APP_KEY` through the Environment package
- with an argument, that string becomes the signing and verification key for the instance
- the same key is used for both `compose()` and `retrieve()`

If `APP_KEY` cannot be resolved, construction fails before you can issue or verify tokens.

## Payload contract

A token can only be composed after at least one payload entry has been added.

Accepted write methods:

- `setClaim(string $key, mixed $value)`
- `setClaims(array $claims)`
- `setData(array $data)`

`setData()` always writes to the `data` claim.

If no payload has been added, `compose()` throws `JwtException::payloadNotFound()`.

## Signing contract

```php
$token = $jwt->compose($keyId, $header);
```

Behavior:

- payload is signed with the instance key and current algorithm
- `$keyId` is optional and is forwarded to the encoded token header as `kid`
- `$header` is optional and is forwarded as custom JWT header fields

The package does not validate header contents itself.

## Algorithm contract

`setAlgorithm()` stores the provided string and returns the same instance.

The package does not validate algorithm names up front. Practical effect:

- invalid or unsupported values are accepted by `setAlgorithm()`
- failures happen later inside `firebase/php-jwt` when `compose()` or `retrieve()` runs

## Verification contract

```php
$payload = $jwt->retrieve($token)->fetchPayload();
```

Behavior:

- `retrieve()` verifies the token with the current instance key and algorithm
- on success, the decoded payload is stored on the instance
- `fetchPayload()` returns that decoded payload object
- `fetchData()` returns the `data` claim as an array, or `null` when the claim is absent
- `fetchClaim()` returns one decoded claim value, or `null` when the claim is absent

The package does not rename or normalize claims.

## Failure surface

`JwtToken` only throws its own package exception for one case:

- empty payload on `compose()`

Signing and verification failures from bad algorithms, invalid signatures, expired tokens, malformed tokens, or unsupported headers come from `firebase/php-jwt` directly.

Handle those upstream exceptions at your application boundary when you verify untrusted tokens.

## Instance state contract

`JwtToken` is stateful.

Practical effect:

- claims added through `setClaim()`, `setClaims()`, and `setData()` stay on the object until you overwrite them or discard the instance
- `retrieve()` updates the stored decoded payload, but it does not clear the compose-side payload array
- using a fresh `JwtToken` instance per token flow is the safest default
