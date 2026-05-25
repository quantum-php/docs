# Captcha Contracts

This page defines the behavior application code can rely on when using Quantum's Captcha package.

## Helper and factory contract

Use the helper as the standard entry point.

```php
$captcha = captcha();
$hcaptcha = captcha('hcaptcha');
```

Resolution rules:

- an explicit adapter name wins
- otherwise the factory uses `captcha.default`
- supported adapter names are `recaptcha` and `hcaptcha`
- unknown adapter names fail during resolution with a captcha exception

`CaptchaFactory::get()` lazily registers itself in DI and reuses one `Captcha` wrapper per adapter name.

## Wrapper contract

`captcha()` returns `Quantum\Captcha\Captcha`, which forwards calls to the active adapter.

Supported public methods are:

- `getAdapter()`
- `getName()`
- `getType()`
- `setType(string $type)`
- `addToForm(string $formIdentifier)`
- `verify(string $response)`
- `getErrorMessage()`

Calling a method the adapter does not implement throws `CaptchaException::methodNotSupported(...)`.

## Type contract

Supported captcha types are:

- `visible`
- `invisible`

Behavior rules:

- adapters may start with the type from config, or `null` if the config block omits it
- `setType()` returns the adapter so you can fluently change mode before rendering
- any other type throws an exception immediately

## Rendering contract

`addToForm()` is the package's rendering entry point.

### Visible mode

Visible mode returns a `<div>` widget placeholder with the adapter's provider-specific class and the configured site key.

### Invisible mode

Invisible mode returns inline JavaScript that:

- waits for `DOMContentLoaded`
- finds the form by id
- finds `button[type=submit]` inside that form
- attaches the provider class, site key, and callback to that button

If invisible mode is active and the form id is empty, rendering fails with an exception.

## Verification contract

`verify()` accepts the response token submitted by the browser.

Behavior rules:

- an empty string or `'0'` is treated as an empty response and returns `false`
- verification requires a configured `secret_key`
- the outgoing request includes the current client IP from `get_user_ip()`
- an empty provider response returns `false`
- a non-object provider response returns `false`
- provider `error-codes` are stored for later access through `getErrorMessage()`
- a `challenge_ts` older than 60 seconds returns `false` with `replay-attack`
- success is `true` only when the provider response contains `success === true`

## Error message contract

`getErrorMessage()` returns:

- the first recorded error code from the most recent failed verification path
- `null` when no error code has been recorded

This is a low-level error surface. The package does not translate provider codes into user-facing messages.

## Integration contract

The package depends on other Quantum packages during normal use:

- Config for lazy loading `config/captcha.php`
- DI for factory reuse
- HttpClient for provider verification requests
- Asset for loading the provider JavaScript returned by `addToForm()`

If those integrations are unavailable or misconfigured, the failure bubbles from the underlying package.
