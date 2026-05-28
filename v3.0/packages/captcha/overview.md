# Captcha

Captcha gives you a small wrapper around reCAPTCHA and hCaptcha so forms can render a challenge and verify the submitted response through one helper.

Use it when you want bot protection in a server-rendered form flow and you want the active provider to come from config instead of hard-coding provider-specific markup.

## Entry point

Use the `captcha()` helper.

```php
$captcha = captcha();

echo $captcha->addToForm('signUpForm');
```

When you do not pass an adapter name, the factory uses `captcha.default` from `config/captcha.php`.

## Supported adapters

Quantum ships two built-in adapters:

- `recaptcha`
- `hcaptcha`

The factory keeps one resolved `Captcha` wrapper per adapter name for the life of the current DI-managed factory instance. Repeated calls like `captcha('recaptcha')` reuse the same wrapper and underlying adapter.

## What the package guarantees

- captcha config is loaded lazily on first use
- each adapter reads `site_key`, `secret_key`, and optional `type` from its config block
- `addToForm()` registers the provider JavaScript through the Asset package before returning markup
- `verify()` sends the response token and current user IP to the provider's verification endpoint
- unsupported adapter names and unsupported forwarded method calls fail immediately

## Important caveats

- invisible captchas require a real form id and a submit button inside that form
- visible vs invisible is adapter state; if you call `setType()`, later calls on the same reused helper instance keep that type until you change it again
- verification returns only `true` or `false`; provider error details are reduced to the first stored error code from `getErrorMessage()`
- tokens older than 60 seconds are treated as replay attacks even if the provider response is otherwise successful

