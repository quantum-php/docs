# Hasher Usage

Use `Quantum\Hasher\Hasher` directly when you need password hashing behavior without the higher-level Auth package.

## Hashing and verifying a password

```php
use Quantum\Hasher\Hasher;

$hasher = new Hasher();

$hash = $hasher->hash('secret');

if ($hasher->check('secret', $hash)) {
    // password matches
}
```

A new instance uses bcrypt with cost `12` by default.

## Lowering the cost in tests or local tooling

Quantum's own tests reduce the cost before hashing so password operations run faster:

```php
$hasher = (new Hasher())->setCost(4);
$hash = $hasher->hash('secret');
```

That pattern is reasonable for tests. Do not copy it into production unless you intentionally want weaker bcrypt work factors.

## Detecting when a stored hash should be upgraded

```php
$hasher = (new Hasher())->setCost(4);
$hash = $hasher->hash('secret');

$hasher->setCost(5);

if ($hasher->needsRehash($hash)) {
    $hash = $hasher->hash('secret');
}
```

This is the normal upgrade path:

1. verify the password with `check()`
2. call `needsRehash()` against the stored hash
3. write a new hash if the current settings require it

## Switching algorithms

```php
$hasher = (new Hasher())->setAlgorithm(PASSWORD_DEFAULT);
$hash = $hasher->hash('secret');
```

Keep two caveats in mind:

- `setAlgorithm()` does not validate the algorithm name itself
- `setCost()` only enforces range checks when the current algorithm is `PASSWORD_BCRYPT`

## Inspecting stored hash metadata

```php
$hasher = (new Hasher())->setCost(4);
$hash = $hasher->hash('secret');

$info = $hasher->info($hash);
```

The returned array is the raw output from PHP's `password_get_info()`. In Quantum's tests, the package expects keys such as `algoName` to be present.

## Recommended usage pattern

For login flows:

- use `check()` to verify the submitted password
- use `needsRehash()` after a successful match
- use a new `hash()` only when the password is first stored or upgraded

If you already use Quantum's Auth package, let that package own the hasher lifecycle instead of sharing one mutable `Hasher` object across unrelated code.
