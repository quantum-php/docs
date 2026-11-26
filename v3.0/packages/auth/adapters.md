# Auth Adapters

Auth ships with two built-in adapters. Both use the same auth service and shared account-flow methods, but they persist authenticated state differently.

## Session adapter

Use `session` for browser-based applications where Quantum should keep the authenticated user in server-side session storage.

```php
$auth = auth('session');
$auth->signin($email, $password, true);
```

### What it does

When a user signs in, the adapter:

- regenerates the PHP session ID
- stores the authenticated user under the `auth_user` session key
- stores only schema fields marked as `visible`

It does this in each of the three places a sign-in completes: in `signin()` without two-factor authentication, in `verifyOtp()` once the OTP is accepted, and in `user()` when the remember cookie signs the user in. The new session ID means that an ID known before the sign-in, for example one planted in the browser, does not lead to the signed-in session. The other data in the session is kept.

`user()` first reads from session storage. If no session user exists, it can restore the user from the remember-token cookie.

### Remember-me behavior

Passing `true` as the third argument to `signin()` enables remember-me behavior. The adapter generates a remember token, stores it through your auth service and writes it to a cookie:

- without two-factor authentication, during `signin()`
- with two-factor authentication, only when `verifyOtp()` accepts the OTP, in the browser that signed in

Until the OTP is verified, `signin()` only keeps the request in that browser's session. A later `signin()` without "remember me", and `signout()`, drop it. A sign-in whose OTP is never entered therefore leaves no cookie that could sign in later.

The remember cookie lifetime comes from `auth.session.remember_lifetime`. If that setting is absent, the default is `2592000` seconds (30 days).

On sign-out, the adapter deletes the session user, regenerates the session ID, clears the stored remember token, and deletes the cookie.

### When the settings are read

The adapter reads `two_fa`, `otp_expires` and `session.remember_lifetime` once, when it is built. An invalid value, such as an `otp_expires` that is not a [whole number](../config/contracts.md#typed-reader-contract), therefore fails there, also while two-factor authentication is off, and never halfway through a sign-in. An auth adapter of your own that uses `Quantum\Auth\Traits\AuthTrait` implements `readConfig(ConfigSection $config)` to read its settings the same way.

### Two-factor caveat

When two-factor auth is enabled, `signin()` returns an OTP token instead of logging the user in immediately, and `verifyOtp()` completes the sign-in. See [Two-factor flow](usage.md#two-factor-flow).

If a remembered user has a pending OTP token in storage, for example from a sign-in that was started but not completed, the adapter refuses to restore that user from the remember cookie until an OTP is verified.

## JWT adapter

Use `jwt` for APIs where the client should carry authentication state in tokens.

```php
$tokens = auth('jwt')->signin($email, $password);

$accessToken = $tokens['accessToken'];
$refreshToken = $tokens['refreshToken'];
```

### What it does

After a successful sign-in without two-factor interruption, the adapter:

- generates a refresh token and stores it through your auth service
- creates a JWT access token from visible user fields
- base64-encodes the signed JWT before returning it
- writes both tokens into the current request/response objects

The response gets a `tokens` payload, and the request object is updated with:

- `Authorization: Bearer <base64-encoded-access-token>`
- the configured refresh-token header

### User restoration and refresh fallback

`user()` tries the access token first.

If access-token parsing or verification fails, the adapter falls back to the refresh token header. When that header matches a stored user, Auth rotates both tokens and then retries `user()` with the new access token.

This means a valid refresh token can transparently refresh the current request's auth state.

### Sign-out behavior

JWT sign-out depends on the refresh token header.

When sign-out succeeds, the adapter:

- clears the stored refresh token through your auth service
- removes the refresh-token request header
- removes the `Authorization` header from the request
- deletes the `tokens` response payload

If the refresh token header is missing or unknown, `signout()` returns `false`.

## Choosing between them

Use `session` when you want classic web login state, session regeneration, and optional remember-me cookies.

Use `jwt` when you need API-friendly access tokens plus refresh-token-based token rotation.

## Shared adapter rules

Both adapters:

- require an auth service class configured at `auth.<adapter>.service`
- validate credentials through the configured service and the Hasher package
- reject inactive accounts
- send activation, reset, and OTP emails through the Mailer package
- depend on schema field mappings from `userSchema()`
