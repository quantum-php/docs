# Auth

Auth provides Quantum's application-level authentication flow.

Use it when you need to sign users in, restore the current user, issue password-reset or activation tokens, or switch between session-based web auth and JWT-based API auth behind one entry point.

## Quick start

```php
if (auth()->signin($email, $password)) {
    return redirect('/dashboard');
}

$user = auth()->user();
```

If you do not pass an adapter name, `auth()` resolves `auth.default` from the auth config.

## What the package gives you

- `auth()` helper as the standard entry point
- adapter resolution for `session` and `jwt`
- one shared `Auth` wrapper per adapter name through `AuthFactory`
- common account flows implemented by both adapters:
  - `signin()`
  - `signout()`
  - `check()`
  - `user()`
  - `signup()`
  - `activate()`
  - `forget()`
  - `reset()`
  - `resendOtp()`
- adapter-specific follow-up methods:
  - `refreshUser()`
  - `verifyOtp()`

## Resolution model

`auth()` returns `Quantum\Auth\Auth`, a thin wrapper around the active adapter.

On first use, the factory:

- loads auth config if it is not already loaded
- resolves the configured service class for the selected adapter
- creates either `SessionAuthAdapter` or `JwtAuthAdapter`
- caches the resulting `Auth` instance by adapter name

Practical effect: repeated `auth()` calls for the same adapter reuse the same auth wrapper during the current runtime.

## Supported adapters

- `session` for browser-oriented, server-side login state
- `jwt` for token-based API authentication

See [Adapters](adapters.md) for the differences that affect integration.

## Shared account flows

### Sign in

`signin()` verifies the configured username field and password hash through your auth service.

If two-factor auth is disabled, sign-in completes immediately.

If two-factor auth is enabled, sign-in does not finish immediately. The package creates an OTP, stores OTP metadata through the auth service, sends the code by email, and returns an OTP token that must be passed to `verifyOtp()`.

### Sign up and activation

`signup()` hashes the submitted password, generates an activation token, persists the user through your auth service, and sends the activation email.

`activate($token)` marks the account as active by clearing the activation token field.

### Password reset

`forget($username)` generates a reset token, stores it through the auth service, sends the reset email, and returns the token.

`reset($token, $password)` replaces the stored password hash and clears the reset token when the token matches a user.

## Schema contract at package level

Auth depends on `AuthServiceInterface::userSchema()` to map logical auth keys to your real storage fields.

The schema must define every key used by `Quantum\Auth\Enums\AuthKeys`, including names for:

- username
- password
- activation token
- reset token
- remember token
- OTP, OTP expiry, OTP token
- access token
- refresh token

If any required key mapping is missing, adapter construction fails with an auth exception.

Fields marked as `visible` in the schema are the only fields that Auth exposes in session state and JWT access-token payloads.

## Important constraints

- Unsupported adapter names fail during resolution.
- Unsupported method calls on `Auth` fail at runtime because the wrapper only forwards methods that exist on the active adapter.
- Inactive accounts cannot sign in.
- Email-based flows depend on the Mailer package and the shared email templates used by the package.

## Read next

- [Usage](usage.md)
- [Adapters](adapters.md)
- [Contracts](contracts.md)
