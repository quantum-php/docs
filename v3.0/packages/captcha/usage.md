# Captcha Usage

Use Captcha when you want one helper for rendering a challenge widget and validating the returned token.

## Render the default provider

```php
$captcha = captcha();

echo $captcha->addToForm('signUpForm');
```

This uses `captcha.default` and returns the markup you should place in the form.

For visible widgets, the returned markup is a provider `<div>`. For invisible widgets, it is an inline `<script>` block.

## Switch providers explicitly

```php
$captcha = captcha('hcaptcha');

echo $captcha->addToForm('contactForm');
```

Use an explicit adapter when different parts of the application do not share the same provider.

## Override the display mode at runtime

```php
$captcha = captcha('recaptcha')->setType('invisible');

echo $captcha->addToForm('checkoutForm');
```

This is useful when the config default is visible but one form should use invisible mode.

Because factory instances are reused, treat runtime type changes as shared state for the rest of the current request.

## Verify the submitted token

```php
$captcha = captcha();
$response = request()->get($captcha->getName() . '-response');

if (!$captcha->verify((string) $response)) {
    $error = $captcha->getErrorMessage();
}
```

`getName()` gives you the provider field prefix:

- `g-recaptcha` for reCAPTCHA
- `h-captcha` for hCaptcha

That means the browser response field is typically `<name>-response`.

## Use it with validation or middleware

A common flow is:

1. render the captcha in the form
2. read the provider response token from the request
3. verify it before creating or updating data
4. surface `getErrorMessage()` through your own validation message layer if needed

The Validation package's built-in captcha rule also resolves the default adapter through `CaptchaFactory::get()`.

## Common pitfalls

- do not call `addToForm()` in invisible mode without a real form id
- make sure the target form contains a `button[type=submit]`
- make sure your layout actually renders registered assets, otherwise the provider script will never load
- expect old or replayed challenge timestamps to fail even when the provider returns a success payload
