# Validation Contracts

This page focuses on the behavior you can rely on when integrating the Validation package.

## Rule storage contract

### Rules are stored per validator instance

A `Validator` object keeps its configured rules until you call:

- `deleteRule(...)`
- `flushRules()`
- or overwrite an existing rule with `updateRule()` / `setRule()`

Do not treat one validator instance as stateless shared infrastructure unless you control its full lifecycle.

### One field can hold one value per rule name

If you register the same rule name again for the same field, the latest value replaces the previous one.

That matters for calls like:

```php
$validator->setRule('title', [Rule::minLen(5)]);
$validator->updateRule('title', Rule::minLen(10));
```

Only `minLen(10)` remains active.

## Input normalization contract

### Missing validated fields become empty strings

Before validation runs, the package inserts `''` for any field that has rules but is absent from the input array.

This has two important effects:

- optional rules like `maxLen(50)` can still pass on omitted fields
- omitted fields with stricter rules like `email()` still return an error

### Validation runs only for configured fields

Extra keys in the input array are ignored unless you registered rules for them.

When you use `same('other_field')`, include that referenced key in the submitted payload too. The validator fills missing validated fields in its working copy, while `same()` reads from the original input array.

## Execution contract

### Rules do not short-circuit

When one field has multiple failing rules, the validator keeps evaluating the remaining rules for that field.

Expect `getErrors()` to contain all failed rule messages for that field, not just the first one.

### Built-in rules run before custom-rule lookup exceptions

For each configured rule name, resolution order is:

1. built-in validator method
2. registered custom closure
3. `BadMethodCallException`

If no built-in or custom rule exists for that name, validation stops with an exception.

### Custom rules must be callable

`addRule()` stores the closure under a rule name.

If the stored value is somehow not callable at execution time, validation throws `RuntimeException`.

## Error contract

### Errors are grouped by field and keyed by rule

Internally, each field stores one error entry per rule name.

In normal usage, `getErrors()` returns:

```php
[
    'email' => [
        'The email field must be valid',
    ],
]
```

### Error messages are translation-driven

`getErrors()` builds messages with:

- `t('common.<field>')` for the field label
- `t('validation.<rule>')` for the rule message

If your translation files are incomplete, the final output quality depends on how the Lang package handles missing keys in your application.

## Typed rule contract

### Some rules require specific value types

Several rule methods are type-hinted, especially:

- string-focused rules like `minLen`, `url`, and `contains`
- upload rules like `fileSize`, `fileMimeType`, `fileExtension`, and `imageDimensions`

If the runtime value does not match the required PHP type, the validator does not convert it for you. PHP raises `TypeError`.

This is especially relevant for optional file uploads: an omitted field becomes `''`, which is not an `UploadedFile`.

## Cross-package dependency contract

### `exists()` and `unique()` depend on the Model package

These rules resolve the provided model class through `ModelFactory` and query one column with `findOneBy()`.

They are appropriate for "record already exists" and "record must exist" checks, but they are only as reliable as the active model and database configuration.

### `captcha()` depends on the Captcha package

The validator does not own captcha configuration. It simply asks the default captcha adapter to verify the submitted value.

### File-image rules may bubble storage exceptions

`imageDimensions()` delegates to `UploadedFile::getDimensions()`.

If the upload is not a readable image, the validator may raise a storage-layer exception instead of returning a normal validation failure.
