# Auth Usage

Use Auth through the `auth()` helper. Pick the adapter that matches your delivery surface: `session` for web requests, `jwt` for APIs.

## Basic session login

```php
if (auth('session')->signin($email, $password, true) === true) {
    return redirect('/dashboard');
}
```

Pass `true` as the third argument when you want remember-me behavior.

Later in the request, or in a future request restored from session state, read the current user with:

```php
$user = auth('session')->user();

if (auth('session')->check()) {
    // authenticated
}
```

## Basic JWT login

```php
$tokens = auth('jwt')->signin($email, $password);

return response()->json([
    'accessToken' => $tokens['accessToken'],
    'refreshToken' => $tokens['refreshToken'],
]);
```

The returned access token is a base64-encoded wrapper around the signed JWT string.

If a later request includes the bearer token, `auth('jwt')->user()` rebuilds the current user from the token payload.

## Two-factor flow

When `two_fa` is enabled in auth config, sign-in does not complete immediately.

```php
$otpToken = auth()->signin($email, $password);
```

The package emails a one-time code and returns an OTP token.

Complete the flow with `verifyOtp()`:

```php
$result = auth()->verifyOtp($otp, $otpToken);
```

Result shape depends on the adapter:

- session adapter: `true` and the user is written to session
- JWT adapter: fresh `accessToken` and `refreshToken` values

If the code expires, verification fails with an auth exception. OTP expiry defaults to 2 minutes unless `otp_expires` is configured.

## Registration and activation

```php
$user = auth()->signup([
    'email' => 'jane@example.com',
    'password' => 'secret',
]);
```

`signup()` persists the user with a hashed password and sends the activation email.

When the user follows your activation link, call:

```php
auth()->activate($token);
```

Until the activation token is cleared, sign-in fails as an inactive account.

## Password reset

Start the reset flow:

```php
$resetToken = auth()->forget($email);
```

If the user exists, Auth stores the reset token and sends the reset email.

Complete the reset with:

```php
auth()->reset($token, $newPassword);
```

This hashes the new password and clears the reset token.

## Refreshing stored auth state after profile changes

If your app updates user data outside the current auth adapter, refresh the stored auth state by UUID:

```php
auth()->refreshUser($uuid);
```

- session adapter: rewrites the session user data
- JWT adapter: issues fresh tokens containing updated visible fields

## Practical caveats

- `auth()` caches one wrapper per adapter name in the factory, so repeated calls reuse the same adapter instance for the current runtime.
- Session auth only restores fields marked visible in the schema.
- JWT auth also limits access-token payloads to visible schema fields.
- JWT sign-out requires the refresh token header, not just the bearer token.
- The package sends activation, reset, and OTP emails using shared email templates, so those templates must exist in the app layout the package expects.
