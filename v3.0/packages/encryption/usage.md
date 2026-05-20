# Encryption Usage

For most application code, use the helpers.

## Encrypting and decrypting a value

```php
$user = [
    'id' => 15,
    'role' => 'admin',
];

$payload = crypto_encode($user);
$decoded = crypto_decode($payload);
```

With the default symmetric type, `crypto_decode($payload)` returns the original PHP value shape after decryption and unserialization.

## Choosing a cryptor type

```php
use Quantum\Encryption\Enums\CryptorType;

$token = crypto_encode('temporary', CryptorType::SYMMETRIC);
$value = crypto_decode($token, CryptorType::SYMMETRIC);
```

Asymmetric mode uses the same helper API:

```php
$token = crypto_encode('temporary', CryptorType::ASYMMETRIC);
$value = crypto_decode($token, CryptorType::ASYMMETRIC);
```

Use asymmetric mode only for short-lived, same-runtime flows. The generated keys are not persisted.

## Working with `CryptorFactory` directly

```php
use Quantum\Encryption\Factories\CryptorFactory;
use Quantum\Encryption\Enums\CryptorType;

$cryptor = CryptorFactory::get(CryptorType::SYMMETRIC);

$encrypted = $cryptor->encrypt('plain text');
$plain = $cryptor->decrypt($encrypted);
```

This bypasses the helper serialization layer. Here you are responsible for passing strings in and out.

## Inspecting the adapter

```php
$cryptor = CryptorFactory::get();

if ($cryptor->isAsymmetric()) {
    // runtime-specific key pair behavior applies
}
```

You can also inspect the concrete adapter with `getAdapter()` when debugging integration behavior.

## Recommended usage patterns

- use symmetric mode for values that must survive beyond one request or process
- ensure `app.key` is configured before using helper-driven packages such as Cookie or Session
- use the raw `Cryptor` API only when you intentionally want string-in/string-out behavior without helper serialization

## Current limitations

- no API for custom ciphers or custom RSA settings
- no persisted public/private key management
- no authenticated payload metadata beyond what OpenSSL and the current wrapper format provide
- helper decoding does not preserve boolean `false` exactly
