# Encryption Adapters

Quantum ships two concrete adapters behind `EncryptionInterface`.

## `SymmetricEncryptionAdapter`

`Quantum\Encryption\Adapters\SymmetricEncryptionAdapter` is the default adapter selected by `CryptorType::SYMMETRIC`.

### Construction

On construction it reads `config()->get('app.key')`.

If the value is empty or falsey, the adapter throws `AppException::missingAppKey()` immediately.

### Encryption format

The adapter uses:

- cipher: `aes-256-cbc`
- key: the configured `app.key`
- IV: random bytes from `openssl_random_pseudo_bytes(...)`

`encrypt()` does the following:

1. generates an IV with the cipher's required length
2. encrypts the plaintext with `openssl_encrypt(...)`
3. base64-encodes the encrypted payload
4. concatenates `<encoded payload>::<encoded iv>`
5. base64-encodes that full string again

So the final ciphertext is a double-encoded wrapper around the encrypted data and IV.

### Decryption behavior

`decrypt()` has an important leniency rule:

- if the input is not valid base64 according to `valid_base64()`, it returns the original string unchanged

When the string does look like valid base64, the adapter expects the decoded payload to contain exactly two pieces separated by `::`.

Failure cases that throw `CryptorException::invalidCipher()` include:

- IV generation failure
- `openssl_encrypt(...)` returning `false`
- missing `::` separator after outer decode
- `openssl_decrypt(...)` returning `false`

### Practical consequences

- symmetric ciphertext is nondeterministic because every call uses a fresh IV
- decrypting plain non-base64 strings is a no-op, not an error
- malformed base64-looking payloads fail hard instead of returning the original input

## `AsymmetricEncryptionAdapter`

`Quantum\Encryption\Adapters\AsymmetricEncryptionAdapter` is selected by `CryptorType::ASYMMETRIC`.

### Construction

The constructor calls `generateKeyPair()` and stores both keys on the adapter instance.

The generated key config is fixed in code:

- key type: `OPENSSL_KEYTYPE_RSA`
- key bits: `1024`
- digest algorithm: `SHA512`

If `openssl_pkey_new(...)` fails, or if `openssl_pkey_get_details(...)` returns `false`, the adapter throws `CryptorException::missingConfig('openssl.cnf')`.

### Encryption and decryption

- `encrypt()` requires the generated public key and returns `base64_encode($encrypted)`
- `decrypt()` requires the generated private key and runs `openssl_private_decrypt(...)` on the base64-decoded input

Because the adapter uses `openssl_public_encrypt(...)` with the default RSA padding and a 1024-bit key, it is only practical for small plaintext values. Large payloads are not chunked or streamed by the package.

If either key property is missing, the adapter throws:

- `CryptorException::publicKeyNotProvided()`
- `CryptorException::privateKeyNotProvided()`

### Important caveats

The adapter does not persist keys anywhere. It also does not accept caller-provided keys.

That means:

- a new adapter instance generates a new unrelated key pair
- ciphertext is only useful while the same adapter instance stays alive
- this adapter is not suitable for durable encrypted storage with the current package API

The methods also do not check the boolean return value of `openssl_public_encrypt(...)` or `openssl_private_decrypt(...)`.

Practical effect:

- oversized plaintext for `encrypt()` can surface as a native PHP/OpenSSL failure instead of a package exception
- invalid, foreign, or mismatched ciphertext for `decrypt()` can do the same

So asymmetric mode is best treated as a narrow same-runtime helper for short secrets, not as a general-purpose encrypted transport layer.
