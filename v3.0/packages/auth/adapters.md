# Authentication Adapters

Quantum allows for flexible authentication via adapters. Each adapter must implement common behaviors while exposing specific configuration options for its underlying strategy.

## SessionAuthAdapter

Used primarily for stateful, browser-based applications.

### Configuration
- **Session Key**: The key under which the user data is stored in the `$_SESSION`.
- **TTL**: Time-to-live for the session (default behavior is server-controlled).

### Lifecycle
- **Sign In**: Serializes the `AuthenticatableInterface` object into the session store.
- **`user()`**: Retrieves and unserializes the object. Returns `null` if the key is missing or invalid.
- **Sign Out**: `session_destroy()` (or unsetting the user key).

## JwtAuthAdapter

Used for stateless APIs.

### Configuration
- **Secret Key**: Used for HMAC signature generation/verification.
- **Algorithm**: The hashing algorithm (e.g., `HS256`).
- **TTL**: Defined in the JWT `exp` (expiration) claim.

### Lifecycle
- **Sign In**: Returns a signed Bearer token.
- **`user()`**: Parses the `Authorization` header, validates the signature/expiry, and hydrates the user model from the token payload.
- **Sign Out**: Effectively client-side. Server-side revocation requires a blacklist (configured separately).
