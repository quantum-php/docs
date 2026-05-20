# Encryption Helpers

The package exposes two global helpers.

## `crypto_encode()`

```php
function crypto_encode($data, string $type = CryptorType::SYMMETRIC): string
```

Behavior:

1. serializes the input with PHP `serialize(...)`
2. resolves a cryptor through `CryptorFactory::get($type)`
3. calls `encrypt(...)` on the resolved cryptor

### Implications

- scalar values, arrays, and objects all go through serialization first
- the output format is helper-level ciphertext, not the raw representation of the original value
- the default cryptor type is symmetric

## `crypto_decode()`

```php
function crypto_decode(string $encryptedData, string $type = CryptorType::SYMMETRIC)
```

Behavior:

1. resolves a cryptor through `CryptorFactory::get($type)`
2. decrypts the string
3. runs `@unserialize(...)` on the decrypted result
4. returns the unserialized value when that result is not `false`
5. otherwise returns the decrypted string

## Type and lifecycle caveats

### Asymmetric helper calls depend on shared instance reuse

Because the asymmetric adapter generates a key pair at construction time, this works only while the same factory-managed adapter instance is reused:

```php
$encrypted = crypto_encode('secret', CryptorType::ASYMMETRIC);
$value = crypto_decode($encrypted, CryptorType::ASYMMETRIC);
```

Within one live DI container, `CryptorFactory` memoization preserves that key pair.

Across a container reset, process restart, or any new asymmetric adapter instance, the same ciphertext is no longer expected to decrypt correctly.

### `false` does not round-trip cleanly

As noted in the package contract, helper decoding cannot distinguish:

- "unserialize failed"
- "unserialize succeeded and the actual value is boolean false"

So helper consumers should not rely on exact `false` round-tripping.

## Where helpers are used in core

Current framework code uses these helpers in at least two places:

- Cookie storage encrypts values before writing and decrypts on read
- Session storage encrypts values before storing and decrypts on read

That makes symmetric mode part of the framework's default data-at-rest behavior for those packages.
