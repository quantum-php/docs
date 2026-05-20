# Hasher Contracts

The Hasher package has no interfaces, but its runtime behavior is still shaped by a few important contracts.

## Bcrypt cost validation happens only for bcrypt

`setCost()` enforces the bcrypt cost range only when the current algorithm is exactly `PASSWORD_BCRYPT`.

Accepted bcrypt range:

- minimum: `4`
- maximum: `31`

Outside that range, the method throws `HasherException::invalidBcryptCost()`.

This validation is stateful. It depends on the algorithm that is currently set on the instance when `setCost()` runs.

## Algorithm changes are not validated by the package

`setAlgorithm()` assigns the provided string directly and returns the same instance.

The package defines `HasherException::algorithmNotSupported(...)`, but `Hasher` does not currently call it.

Practical effect:

- invalid or unsupported algorithm names are not rejected at `setAlgorithm()` time
- failures, if any, happen later inside PHP's password functions

## Hashing and rehash checks use the current instance settings

These methods use the current algorithm and cost stored on the object:

- `hash()`
- `needsRehash()`

If you change either property after creating a hash, `needsRehash()` can flip from `false` to `true` for the same stored hash.

That is how the package signals that an existing password should be upgraded to newer hashing settings.

## Verification is hash-driven, not config-driven

`check()` only calls `password_verify($password, $hash)`.

It does not compare the stored hash against the instance's configured algorithm or cost first.

So this is valid:

- hash a password with one `Hasher` configuration
- verify it later with another `Hasher` object configured differently

Use `needsRehash()` separately when you want to enforce current hashing settings after a successful login.

## Metadata comes from the hash

`info()` returns `password_get_info($hash)` directly.

That means its result reflects the provided hash payload, not the current `Hasher` object's local properties.

## Exception surface

The package exposes two exception factories:

- `HasherException::invalidBcryptCost()`
- `HasherException::algorithmNotSupported(string $algorithm)`

In current package code, only `invalidBcryptCost()` is thrown by `Hasher` itself.
