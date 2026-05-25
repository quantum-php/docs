# Csrf Usage

## Add a token to an HTML form

```php
<form method="POST" action="/profile">
    <input type="hidden" name="csrf-token" value="<?= csrf_token(); ?>">

    <!-- other fields -->
</form>
```

This is the most direct package flow: render a token, then expect the same token back on submit.

## Validate before changing state

```php
use Quantum\Csrf\Exceptions\CsrfException;

try {
    csrf()->checkToken(request());

    // continue with the update
} catch (CsrfException $e) {
    // reject the request
}
```

Call validation before writes such as create, update, delete, or other sensitive POST-style actions.

## Regenerate after a successful submission

Because validation is single-use, render or fetch a new token after a successful check if the user will submit another protected request.

```php
csrf()->checkToken(request());

$newToken = csrf_token();
```

## Know the boundaries

Keep these constraints in mind:

- the package stores only one active token per session
- repeated token generation returns the existing token until validation clears it
- validation throws exceptions instead of returning `false`
- `csrf_token()` cannot work until `APP_KEY` is available

## Good fit for this package

Use Csrf when you want a simple framework-level guard around forms and other state-changing requests.

If you need multiple concurrent tokens per user flow, token scoping per form, or custom rotation rules, you will need to build those rules around the package's single-token contract.
