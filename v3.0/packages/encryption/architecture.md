# Encryption Architecture

The package uses a simple factory-plus-adapter design.

## Resolution flow

A typical helper call follows this path:

```text
crypto_encode()/crypto_decode()
  -> CryptorFactory::get($type)
  -> Di-managed CryptorFactory instance
  -> CryptorFactory::resolve($type)
  -> Cryptor(new <adapter>())
  -> adapter->encrypt() / adapter->decrypt()
```

## `CryptorFactory` lifecycle

`CryptorFactory::get()` uses `Quantum\Di\Di` as its singleton boundary:

1. if `CryptorFactory` is not registered yet, it registers the class
2. it resolves the factory from the container with `Di::get(self::class)`
3. it calls `resolve($type)` on that shared factory instance

Inside the factory, `$instances` memoizes one `Cryptor` per type string.

Practical effect:

- repeated symmetric requests reuse the same symmetric `Cryptor`
- repeated asymmetric requests reuse the same asymmetric `Cryptor`
- both lifetimes are tied to the current DI container

## `Cryptor` wrapper behavior

`Quantum\Encryption\Cryptor` stores exactly one `EncryptionInterface` adapter.

It exposes:

- `getAdapter()` to inspect the concrete adapter
- `isAsymmetric()` as a concrete-type check against `AsymmetricEncryptionAdapter`
- `__call()` to forward runtime method calls to the adapter

`__call()` is guarded with `method_exists(...)`. Calling an unsupported method throws `CryptorException::methodNotSupported($method, <adapter class>)`.

In practice, the intended public methods are still just:

- `encrypt(string $plain): string`
- `decrypt(string $encrypted): string`

## Factory adapter map

`CryptorFactory::ADAPTERS` is a fixed constant map:

- `symmetric` -> `SymmetricEncryptionAdapter`
- `asymmetric` -> `AsymmetricEncryptionAdapter`

There is no extension point in the current package for replacing this map at runtime.

## State model differences

### Symmetric adapter state

The symmetric adapter stores only one piece of state: the resolved application key.

### Asymmetric adapter state

The asymmetric adapter stores a generated public/private key pair in object properties.

Because the keys are generated inside `__construct()`, the object's lifetime is the key lifetime. This is the main architectural constraint of the package.
