# JWT

The Jwt package gives Quantum a small wrapper around `firebase/php-jwt` for signing and verifying JSON Web Tokens.

Use it when you want to:

- issue signed tokens with application-specific claims
- attach user-facing payload data under a dedicated `data` claim
- verify an incoming token and read its claims back through a small Quantum API

This package is intentionally narrow. It does not manage token refresh, revocation, storage, or transport. Those concerns stay in higher-level packages such as Auth.

## Package shape

The package consists of:

- `Quantum\Jwt\JwtToken`, the only runtime API
- `Quantum\Jwt\Exceptions\JwtException`, used when composing without any payload
- `Quantum\Jwt\Enums\ExceptionMessages`, which defines package-local exception text

## Default behavior

A new `JwtToken` instance:

- uses `env('APP_KEY')` as the signing key unless you pass one explicitly
- defaults to the `HS256` algorithm
- starts with an empty payload
- does not preload standard JWT claims on its own

If the environment layer is unavailable or `APP_KEY` cannot be resolved, construction fails through the Environment package.

## What counts as payload

`compose()` only works after you add at least one payload entry.

You can do that with any of these methods:

- `setClaim()` for one claim
- `setClaims()` for several claims
- `setData()` for application data stored under the `data` claim

If no payload was added, `compose()` throws `JwtException::payloadNotFound()`.

## Verification model

`retrieve($jwt)` verifies the token with the current key and algorithm, stores the decoded payload on the instance, and returns the same `JwtToken` object for chaining.

Verification failures are not wrapped by Quantum. Invalid signatures, expired tokens, malformed payloads, and unsupported algorithms surface from `firebase/php-jwt` directly.

After that you can read values with:

- `fetchPayload()` for the full decoded object
- `fetchData()` for the `data` claim as an array
- `fetchClaim()` for one named claim

The package does not normalize or remap claim names. What you sign is what you read back.

## Important constraints

- The package only exposes one signer/verifier class; there is no factory, helper, or driver registration layer.
- `setAlgorithm()` accepts any string and stores it as-is. Validation happens later inside `firebase/php-jwt` when encoding or decoding.
- The same algorithm configured on the instance is used for both `compose()` and `retrieve()`. If you change it between issuing and verifying, verification will fail.
- `compose()` optionally accepts a key ID and custom header array, then forwards both directly to `firebase/php-jwt` during encoding.
- `setLeeway()` changes `Firebase\JWT\JWT::$leeway`, which is a static upstream setting. In practice, that means the leeway applies process-wide for later JWT verification in the same runtime.
- `JwtToken` keeps both its compose-side claims and its fetched decoded payload on the instance. Reusing one instance across multiple flows can carry old state forward unless you overwrite it deliberately or create a fresh object.
- The package returns a plain JWT string. If another package wraps that token in base64 for transport, unwrap it before calling `retrieve()`.
