# Authenticatable Contract

The `AuthenticatableInterface` is the contract that any model must fulfill to be usable by Quantum's authentication system. This ensures that the `AuthFactory` adapters can consistently retrieve user identity and authorization metadata.

## Contract Definition

Any class, usually a Data Object or Model, used for authentication must implement `Quantum\Auth\Contracts\AuthenticatableInterface`.

### Required Methods

```php
interface AuthenticatableInterface {
    /**
     * Get the unique identifier for the user.
     * @return mixed
     */
    public function getAuthIdentifier();

    /**
     * Get the password hash or credential for verification.
     * @return string
     */
    public function getAuthPassword();

    /**
     * Get the authentication salt (if supported by the adapter).
     * @return string|null
     */
    public function getAuthSalt();
}
```

## Implementation Guide

While simple models can implement this directly, it is standard practice in Quantum to use the `AuthTrait` to handle identifier and password boilerplate.

```php
use Quantum\Auth\Traits\AuthTrait;
use Quantum\Auth\Contracts\AuthenticatableInterface;

class User implements AuthenticatableInterface {
    use AuthTrait;
    // ...
}
```

By using the `AuthTrait`, your model gains standard property methods which align with the expected data layer of the `SessionAuthAdapter` and `JwtAuthAdapter`.
