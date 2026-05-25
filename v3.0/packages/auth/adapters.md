# Auth Adapters

Auth ships with two built-in adapters. Both use the same auth service and shared account-flow methods, but they persist authenticated state differently.

## Session adapter

Use `session` for browser-based applications where Quantum should keep the authenticated user in server-side session storage.

```php
$auth = auth('session');
$auth->signin($email, $password, true);
```

### What it does

After a successful sign-in without two-factor interruption, the adapter:

- regenerates the PHP session ID
- stores the authenticated user under the `auth_user` session key
- stores only schema fields marked as `visible`

`user()` first reads from session storage. If no session user exists, it can restore the user from the remember-token cookie.

### Remember-me behavior

Passing `true` as the third argument to `signin()` enables remember-me behavior.

The adapter then:

- generates a remember token
- stores that token through your auth service
- writes the token to a cookie

The remember cookie lifetime comes from `auth.session.remember_lifetime`. If that setting is absent, the default is `2592000` seconds (30 days).

On sign-out, the adapter deletes the session user, regenerates the session ID, clears the stored remember token, and deletes the cookie.

### Two-factor caveat

When two-factor auth is enabled, `signin()` returns an OTP token instead of logging the user in immediately.

If a remembered user still has a pending OTP token in storage, the adapter refuses to restore that user from the remember cookie.

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
