# Validation Usage

## Define rules for one field

Use `setRule()` when one field owns a small rule list.

```php
use Quantum\Validation\Rule;
use Quantum\Validation\Validator;

$validator = new Validator();

$validator->setRule('email', [
    Rule::required(),
    Rule::email(),
]);

$isValid = $validator->isValid([
    'email' => 'jane@example.com',
]);
```

Each `Rule::...()` call returns the rule shape that `Validator` expects.

## Define rules for a whole payload

`setRules()` is the normal choice for form or request validation.

```php
$validator->setRules([
    'email' => [
        Rule::required(),
        Rule::email(),
        Rule::unique(User::class, 'email'),
    ],
    'password' => [
        Rule::required(),
        Rule::minLen(6),
    ],
    'confirm_password' => [
        Rule::required(),
        Rule::same('password'),
    ],
]);

if (!$validator->isValid($request->all())) {
    return response()->json([
        'errors' => $validator->getErrors(),
    ], 422);
}
```

## Update or remove rules on the same validator

Rules stay on the validator instance until you change them.

```php
$validator->setRule('title', [
    Rule::minLen(10),
    Rule::maxLen(100),
]);

$validator->updateRule('title', Rule::minLen(5));
$validator->deleteRule('title', 'maxLen');
```

Use `flushRules()` when you want to clear both rules and collected errors before reusing the object for a different validation job.

## Add a custom rule

Custom rules are closures registered by name.

```php
$validator->addRule('allowedDomain', function ($value, string $domain): bool {
    return str_ends_with((string) $value, '@' . $domain);
});

$validator->setRule('email', [
    Rule::required(),
    Rule::allowedDomain('example.com'),
]);
```

If the rule name used in `setRule()` or `setRules()` does not exist as a built-in method or registered custom rule, validation throws `BadMethodCallException`.

## Validate file uploads

File rules work on `UploadedFile` objects, so validate the normalized request payload rather than raw `$_FILES` arrays.

```php
$validator->setRule('image', [
    Rule::fileSize(1_000_000),
    Rule::fileExtension('jpg', 'jpeg', 'png'),
    Rule::imageDimensions(1200, 630),
]);

if (!$validator->isValid($request->all())) {
    return ['errors' => $validator->getErrors()];
}
```

A few practical caveats matter here:

- `fileSize()` compares byte counts
- `fileMimeType()` uses the detected MIME type from the uploaded file contents
- `imageDimensions()` expects a real image upload and may bubble a storage exception for non-image input
- if the upload field is missing entirely, typed file rules do not skip it automatically

## Return translated errors

`getErrors()` returns errors grouped by field.

```php
$errors = $validator->getErrors();
```

Each message is built through the Lang package using:

- `validation.<rule>` for the rule message
- `common.<field>` for the field label

That means translated output depends on those translation keys being available in your active language files.

## Common patterns

### Optional text field with format rules

Optional text fields work only when their other rules accept an empty string.

```php
$validator->setRule('display_name', [
    Rule::maxLen(50),
]);
```

This passes when `display_name` is missing because the package substitutes `''` and `maxLen(50)` still succeeds.

By contrast, an omitted optional field with `Rule::email()` still fails because `email('')` is invalid.

### Password confirmation

Use `same()` on the field you want to validate against another field name.

```php
$validator->setRule('confirm_password', [
    Rule::required(),
    Rule::same('password'),
]);
```

### Database-backed checks

`exists()` and `unique()` are useful for signup, reset-token, and ownership flows.

```php
$validator->setRule('email', [
    Rule::required(),
    Rule::unique(User::class, 'email'),
]);
```

These rules resolve the model through the Model package, so they rely on working model and database configuration.
