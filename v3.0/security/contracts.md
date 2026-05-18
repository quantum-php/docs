# Authenticatable Contract

The `AuthServiceInterface` is the contract that any authentication service must fulfill to integrate with Quantum's authentication system.

## Contract Definition

The actual interface definition in the source code is:

```php
interface AuthServiceInterface
{
    /**
     * Get
     */
    public function get(string $field, ?string $value): ?User;

    /**
     * Add
     */
    public function add(array $data): User;

    /**
     * Update
     */
    public function update(string $field, ?string $value, array $data): ?User;

    /**
     * User Schema
     */
    public function userSchema(): array;
}
```

This interface ensures that the authentication system can consistently interact with the `User` object and schema across different storage or service implementations.
