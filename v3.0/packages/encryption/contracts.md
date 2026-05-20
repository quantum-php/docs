# Encryption Contracts

The package has one explicit interface and a few code-level behavioral contracts that matter in practice.

## `EncryptionInterface`

`Quantum\Encryption\Contracts\EncryptionInterface` defines two methods:

- `encrypt(string $plain): string`
- `decrypt(string $encrypted): string`

Any adapter used by `Cryptor` must implement both.

## `Cryptor` forwarding contract

`Quantum\Encryption\Cryptor` is not an encryption implementation by itself. It is a delegating wrapper around one adapter.

Current behavior:

- `getAdapter()` returns the exact adapter instance it wraps
- `isAsymmetric()` returns `true` only when the adapter is an `AsymmetricEncryptionAdapter`
- `__call()` forwards method calls only if the adapter actually defines the method

So the package contract is adapter-shaped, even when consumers interact with `Cryptor`.

## Factory contract

`CryptorFactory::resolve($type)` memoizes one `Cryptor` instance per type string on the factory object.

This means the package contract is not "new instance every call". It is "shared cryptor per type per factory instance".

Because `CryptorFactory::get()` itself resolves the factory through `Di::get(...)`, the effective contract becomes:

- one shared factory per DI container
- one shared cryptor per type inside that factory

## Error contract

The package raises a mix of package-specific and shared exceptions.

Common cases:

- unsupported type -> `CryptorException::adapterNotSupported(...)`
- unsupported forwarded method -> `CryptorException::methodNotSupported(...)`
- missing app key in symmetric mode -> `AppException::missingAppKey()`
- invalid symmetric cipher payload -> `CryptorException::invalidCipher()`
- missing asymmetric key properties -> `CryptorException::publicKeyNotProvided()` or `privateKeyNotProvided()`
- OpenSSL key generation/config failure -> `CryptorException::missingConfig('openssl.cnf')`

## Serialization contract in helpers

The package helpers add another contract above the raw adapters:

- `crypto_encode($data, ...)` always serializes the input before encrypting it
- `crypto_decode($encrypted, ...)` decrypts first, then attempts `@unserialize(...)`

If `unserialize(...)` returns anything other than `false`, that value is returned.

If `unserialize(...)` returns `false`, the helper falls back to the decrypted string.

Important edge case:

```php
$value = false;
$encoded = crypto_encode($value);
$decoded = crypto_decode($encoded);
```

`serialize(false)` becomes `b:0;`, and `unserialize('b:0;')` returns `false`. Because the helper uses `!== false` as its success check, this round trip returns the string `b:0;` instead of boolean `false`.
