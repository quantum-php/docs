# Csrf Contracts

This page covers the behavior you can rely on when integrating with the Csrf package.

## Token key contract

The package uses one fixed key name:

- `csrf-token`

That key is used for session storage and for request lookup during validation.

## Token generation contract

```php
$token = csrf()->generateToken($key);
```

`generateToken()` creates a token only when the current session does not already hold one.

Practical effect:

- the first call stores and returns a token
- later calls return the same token for the current session lifecycle
- generating a token again does not rotate it automatically

If you want a fresh token after a successful submission, call `csrf_token()` or `generateToken()` again after validation cleared the previous one.

## Validation contract

```php
csrf()->checkToken(request());
```

`checkToken()` requires the request to expose a token under `csrf-token`.

Validation rules:

1. if the request does not contain a token, the package throws `CsrfException`
2. if the request token does not exactly match the session token, the package throws `CsrfException`
3. if the tokens match, the package returns `true`

## Single-use contract

Successful validation immediately clears the token state:

- deletes `csrf-token` from session storage
- deletes `csrf-token` from the current request input
- deletes `X-csrf-token` from the current request headers

That means the same token is not meant to pass validation twice in the same session.

## Session dependency contract

`Csrf` builds itself around the current Session package instance.

If your application does not have working session storage, token generation and validation cannot behave correctly.

## Failure behavior

The package exposes two validation failures:

- missing token
- token mismatch

Both failures are raised as `CsrfException` instances. The package does not return `false` for validation failure.
