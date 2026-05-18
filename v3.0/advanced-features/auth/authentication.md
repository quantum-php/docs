# Authentication

The Quantum PHP Framework provides a robust authentication system managed through the `AuthFactory`. The `auth()` helper resolves to an `AuthFactory` instance, which handles the selection and instantiation of the appropriate authentication adapter based on application configuration.

## Auth Lifecycle and Caching

The `AuthFactory` implements an in-process instance cache: once an authentication adapter (such as `SessionAuthAdapter` or `JwtAuthAdapter`) is resolved and instantiated for the current process, it is cached to ensure that subsequent calls to `auth()` within the same request lifecycle yield the same adapter instance.

## Auth Adapters Comparison

Quantum supports multiple authentication strategies via adapters. The following table summarizes the behavior differences between the built-in Session and JWT adapters:

| Attribute | SessionAuthAdapter | JwtAuthAdapter |
| :--- | :--- | :--- |
| **Signin Flow** | Persists user in server-side session | Generates signed token sent to client |
| **`user()` Source** | Retrieved from session storage | Extracted from verified JWT payload |
| **Signout Effect** | Destroys server-side session | Invalidates token (if blacklisting is enabled) |
| **State Carrier** | Cookie / Session ID | HTTP `Authorization` Header (Bearer) |

## Middleware and Lifecycle

Authentication is typically enforced at the request level.

- **Request Lifecycle**: For information on when authentication occurs in the request-response cycle, see [Advanced Request Lifecycle](../advanced-features/request-lifecycle.md).
- **Enforcement**: Middleware is the recommended approach for protecting routes. See [Middleware](../core-concepts/middleware.md) for details on how to register and apply auth-guarding middleware.
