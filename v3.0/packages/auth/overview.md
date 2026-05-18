# Authentication

The Quantum PHP Framework provides a robust authentication system that is fundamental to the framework's security contract. Rather than treating authentication as an optional add-on, Quantum integrates it deeply into the request lifecycle. 

The system is managed through the `AuthFactory`, which acts as the central orchestrator for all authentication needs.

## The `AuthFactory` Contract

The `auth()` helper is the primary entry point, resolving to a singleton-managed `AuthFactory` instance. This factory handles the complexity of:
1. **Adapter Resolution**: It dynamically selects the authentication strategy (e.g., `Session` or `JWT`) based on the application's configuration.
2. **Deterministic Lifecycle Caching**: Once an adapter is resolved for a given request, the `AuthFactory` caches the instance. This ensures that every call to `auth()->user()` or `auth()->check()` within the same request lifecycle points to the exact same authenticated state.
3. **Guard Configuration**: It allows for specific auth-guard configuration, enabling you to switch auth strategies per route or module (e.g., sessions for web, JWT for API).

## Authentication Strategy Comparison

Choosing the correct strategy is vital for the systemic security of a Quantum module. The following table differentiates the supported adapters:

| Attribute | SessionAuthAdapter | JwtAuthAdapter |
| :--- | :--- | :--- |
| **Typical Use** | Browser-based Web Apps | API and Microservices |
| **Signin Flow** | Persists user in native PHP session | Generates signed client-side token |
| **`user()` Source** | Retrieved from session storage | Extracted from verified JWT payload |
| **Termination** | `session_destroy()` side-effect | Token expiration / Blacklisting |
| **State Carrier** | Secure Cookie / Session ID | `Authorization: Bearer <token>` |

## Integration with Core Lifecycle

Authentication is not bolted-on; it is an intrinsic part of the request flow:

- **Middleware Enforcement**: Authentication checks should be applied via middleware using the `auth` guard. This aligns with standard Quantum patterns where middleware protects sensitive controllers. See [Middleware](../core-concepts/middleware.md) for enforcement patterns.
- **Request Lifecycle**: For high-level details on when authentication state is initialized vs. when middlewares trigger, see [Advanced Request Lifecycle](../advanced-features/request-lifecycle.md).

## Best Practices

- **Avoid Manual Instance Handling**: Always use the `auth()` helper instead of manually instantiating `AuthFactory`.
- **Consistency**: Stick to one auth adapter per request. Mixing `SessionAuthAdapter` and `JwtAuthAdapter` in a single request flow can lead to ambiguous state ownership.
- **Security Defaults**: Ensure your `JwtAuthAdapter` configuration uses strong signing algorithms (verify via `shared/config/auth.php`).

