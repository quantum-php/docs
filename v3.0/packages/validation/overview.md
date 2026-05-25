# Validation

The Validation package gives Quantum a small rule engine for checking request data, uploads, and model-backed existence rules before you continue into controller or service logic.

Use it when you want to validate an input array against one or more named rules and then return translated field errors back to the caller.

## Main entry points

The package is centered around two classes:

- `Quantum\Validation\Validator` stores rules, runs validation, and collects errors
- `Quantum\Validation\Rule` is a fluent rule builder for `setRule()` and `setRules()`

## Typical flow

```php
use Quantum\Validation\Rule;
use Quantum\Validation\Validator;

$validator = new Validator();

$validator->setRules([
    'email' => [
        Rule::required(),
        Rule::email(),
    ],
    'password' => [
        Rule::required(),
        Rule::minLen(6),
    ],
]);

if (!$validator->isValid($request->all())) {
    return ['errors' => $validator->getErrors()];
}
```

## When to use it

This package fits well when:

- you already have request data as an array
- validation should stay close to a controller or middleware boundary
- you want one place to combine built-in and custom rules
- you want user-facing error messages to come from the Lang package

## What the package covers

The built-in rules are grouped around a few common jobs:

- presence and format checks like `required`, `email`, `date`, and `regex`
- type and numeric checks like `integer`, `float`, `boolean`, `minNumeric`, and `maxNumeric`
- string length and membership checks like `minLen`, `containsList`, and `doesntContainsList`
- file upload checks like `fileSize`, `fileMimeType`, `fileExtension`, and `imageDimensions`
- environment or integration checks like `urlExists`, `exists`, `unique`, and `captcha`

See [Rules](rules.md) for the full rule set and the important caveats for each category.

## Important constraints

- Validation is instance-local. A `Validator` keeps its rules until you delete or flush them.
- Missing fields are normalized to an empty string before validation runs.
- Rules do not short-circuit. If one field has three failing rules, all three errors are collected.
- Some rules depend on other packages at runtime, especially `exists`, `unique`, `captcha`, and translated error output.
- File rules expect `Quantum\Storage\UploadedFile` values. A missing upload is not skipped automatically.

## Read next

- [Usage](usage.md)
- [Rules](rules.md)
- [Contracts](contracts.md)
