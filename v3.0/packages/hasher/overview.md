# Hasher

The Hasher package is Quantum's thin wrapper around PHP's password hashing API.

It gives the framework one small object for four jobs:

- hashing plaintext passwords
- verifying plaintext against an existing hash
- checking whether an existing hash should be rehashed
- reading metadata from a stored hash

Unlike packages such as Auth or Cache, this package does not include a factory, helper, or container integration layer. Core code instantiates `Quantum\Hasher\Hasher` directly where it needs one.

## Package shape

The package contains three source pieces:

- `Quantum\Hasher\Hasher` implements the hashing API
- `Quantum\Hasher\Exceptions\HasherException` defines package-specific runtime errors
- `Quantum\Hasher\Enums\ExceptionMessages` stores local exception message templates

## Defaults

A new `Hasher` starts with these defaults:

- algorithm: `PASSWORD_BCRYPT`
- cost: `12`

Those defaults stay on the instance until you change them with `setAlgorithm()` or `setCost()`. You can inspect the current values with `getAlgorithm()` and `getCost()`.

## Where the framework uses it

Current core integrations use fresh `Hasher` instances directly:

- `AuthFactory` creates a new hasher for each auth adapter instance
- `Csrf` creates a hasher in its constructor and uses it to hash generated token material

That means configuration is instance-local. Changing one `Hasher` object does not affect any other caller.

## What the package does not do

The package is intentionally small.

It does not:

- persist hashing configuration globally
- validate algorithm names in `setAlgorithm()`
- provide a package helper like `hasher()`
- add its own salting or key-management layer on top of PHP's password API

## Main behavior

`Hasher::hash()` and `Hasher::needsRehash()` both use the instance's current algorithm and cost.

`Hasher::check()` ignores those properties and simply calls `password_verify()` against the stored hash.

`Hasher::info()` returns the raw structure from `password_get_info()`, so the metadata comes from the hash itself, not from the current `Hasher` configuration.

## Practical setup rule

When you customize hashing settings, set the algorithm before the cost.

That keeps bcrypt cost validation aligned with the active algorithm and avoids carrying a cost value that was accepted under one algorithm choice but used later under another.
