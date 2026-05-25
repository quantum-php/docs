# Captcha Adapters

Quantum exposes the same `captcha()` API for both built-in providers. Choose the adapter based on the provider you want to embed in your forms.

## Choosing an adapter

- Use `recaptcha` when your project is configured for Google reCAPTCHA.
- Use `hcaptcha` when your project is configured for hCaptcha.

```php
$captcha = captcha('recaptcha');
```

If you omit the adapter name, Quantum resolves `captcha.default`.

## Shared config contract

Each adapter expects a config block under `config/captcha.php`:

```php
return [
    'default' => 'recaptcha',

    'recaptcha' => [
        'type' => 'visible',
        'secret_key' => '...',
        'site_key' => '...',
    ],

    'hcaptcha' => [
        'type' => 'visible',
        'secret_key' => '...',
        'site_key' => '...',
    ],
];
```

Required keys per adapter:

- `secret_key`
- `site_key`

Optional key:

- `type` - `visible` or `invisible`

## reCAPTCHA adapter

Use `recaptcha` for Google's widget and verification endpoint.

### Runtime behavior

- renders markup with the `g-recaptcha` class
- loads `https://www.google.com/recaptcha/api.js`
- verifies responses through Google's `siteverify` endpoint
- expects the request field name `g-recaptcha-response`

## hCaptcha adapter

Use `hcaptcha` for hCaptcha's widget and verification endpoint.

### Runtime behavior

- renders markup with the `h-captcha` class
- loads `https://hcaptcha.com/1/api.js?onload=onLoadCallback&recaptchacompat=off`
- verifies responses through hCaptcha's `siteverify` endpoint
- expects the request field name `h-captcha-response`

## Shared adapter behavior

Both adapters share these rules:

- they support `visible` and `invisible` modes only
- `addToForm()` returns HTML or inline script, it does not write directly to the response
- `verify()` performs a GET request with `secret`, `response`, and `remoteip`
- `getErrorMessage()` returns the first stored error code, or `null` when no error has been recorded

## Caveats

- adapter construction assumes the configured keys exist; missing config values surface as runtime failures from PHP or later verification failures
- invisible mode wires the provider class onto `button[type=submit]` inside the target form, so custom JavaScript-only submit flows need to account for that
- the package does not normalize provider-specific error codes into friendlier messages
