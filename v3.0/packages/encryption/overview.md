# Encryption

The Encryption package gives Quantum a small runtime API for encrypting and decrypting values. It exposes two built-in modes behind the same `Cryptor` wrapper:

- symmetric encryption with the application key
- asymmetric encryption with an in-memory RSA key pair

In normal application code, the public entry points are the `crypto_encode()` and `crypto_decode()` helpers.

## Package shape

The package is built from these parts:

- `Quantum\Encryption\Factories\CryptorFactory` resolves a `Cryptor` by type
- `Quantum\Encryption\Cryptor` wraps one adapter and forwards method calls to it
- `Quantum\Encryption\Contracts\EncryptionInterface` defines `encrypt()` and `decrypt()`
- `Quantum\Encryption\Adapters\SymmetricEncryptionAdapter` uses OpenSSL AES-256-CBC
- `Quantum\Encryption\Adapters\AsymmetricEncryptionAdapter` generates a temporary RSA key pair

## Supported types

`Quantum\Encryption\Enums\CryptorType` defines the only supported factory types:

- `CryptorType::SYMMETRIC`
- `CryptorType::ASYMMETRIC`

Any other type passed to `CryptorFactory::get()` or the helpers fails with `CryptorException::adapterNotSupported(...)`.

## What the package is good for

### Symmetric mode

Symmetric mode is the stable default. It reads `config()->get('app.key')` once in the adapter constructor and uses that key for both encryption and decryption.

This is the mode used indirectly by other core packages such as Cookie and Session.

### Asymmetric mode

Asymmetric mode is transient. The adapter generates a fresh RSA key pair in its constructor and keeps both keys only on that adapter instance.

That means ciphertext encrypted by one asymmetric adapter instance can only be decrypted by the same live instance. If the container is rebuilt or a new process creates a new adapter, old asymmetric ciphertext is no longer decryptable through this package API.

## Important runtime constraints

- the package depends on the OpenSSL extension
- symmetric mode requires `app.key`; construction fails with `AppException::missingAppKey()` when it is absent
- asymmetric mode requires OpenSSL key generation support and throws `CryptorException::missingConfig('openssl.cnf')` when key generation or key detail lookup fails
- the package does not expose configuration for cipher choice, RSA key size, digest algorithm, or persistent key storage
- the package only ships two built-in adapters; there is no public registration API for custom encryption drivers
