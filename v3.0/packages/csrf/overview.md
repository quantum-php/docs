# Csrf

Csrf gives you a small session-backed token guard for state-changing requests.

Use it when you need to issue a token during page rendering and verify that the same request later posts it back before you mutate application state.

## What the package provides

- `Quantum\Csrf\Csrf` for token generation and validation
- helper access through `csrf()` and `csrf_token()`
- single-use validation that clears the stored token after a successful match

## Quick example

Render a token into a form:

```php
<input type="hidden" name="csrf-token" value="<?= csrf_token(); ?>">
```

Validate it before handling a state-changing request:

```php
csrf()->checkToken(request());
```

## How it works in practice

The package stores one token in the current session under `csrf-token`.

- `csrf_token()` creates the token the first time you call it in the current token lifecycle
- repeated calls return the same stored token until validation succeeds or the session entry is cleared
- `checkToken()` compares the incoming request token with the session token and then deletes the stored token on success

That makes the default flow single-use.

## Important behavior

- the package keeps only one active token per session at a time
- successful validation removes the token from both session storage and the current request object
- missing or mismatched tokens throw `CsrfException`
- `csrf_token()` depends on `APP_KEY`; if that value is missing, the helper throws an app exception instead of returning a token

