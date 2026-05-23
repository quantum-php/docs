# Validation Rules

This page summarizes the built-in rules shipped by the package.

## Presence and format rules

### `required`

Passes only when the value is neither an empty string nor `0`.

That means both `''` and `'0'` fail. Integer `0` also fails because the rule casts to string first.

### `email`

Validates a standard email address with PHP's `FILTER_VALIDATE_EMAIL`.

### `creditCard`

Validates the card number with a Luhn-style checksum after stripping non-digit characters.

### `iban`

Validates IBAN format and checksum. It depends on `bcmod()` support for the final modulus check.

### `name`

Accepts letters, spaces, apostrophes, and hyphens.

### `streetAddress`

Requires a value that contains at least one letter, one digit, and one whitespace character.

### `phoneNumber`

Accepts a narrow set of common phone number layouts such as:

- `555-555-5555`
- `555 555 5555`
- `1 (519) 555-4422`
- `+1-555-555-5555`

### `date(?string $format = null)`

Without a format, the package accepts only values that round-trip to one of these shapes:

- `Y-m-d`
- `Y-m-d H:i:s`

When you pass a format, the value must match that format exactly.

### `starts(string $text)`

Checks that the value begins with the provided prefix.

### `regex(string $pattern)`

Runs a custom regular expression with `preg_match()`.

### `jsonString`

Passes only when decoding produces an object.

This is stricter than "valid JSON" in general. JSON arrays, numbers, booleans, and strings do not satisfy this rule.

### `same(string $otherField)`

Checks loose equality against another field in the same input payload.

Use it for password confirmation or duplicate-entry checks.

### `captcha`

Delegates to the Captcha package's default adapter and calls `verify()`.

Use it only after the Captcha package is configured.

## Database-backed rules

### `unique(string $modelClass, string $column)`

Passes when the resolved model does not find an existing record for the given column value.

### `exists(string $modelClass, string $column)`

Passes when the resolved model does find an existing record for the given column value.

For both rules:

- pass a model class, not a table name
- the model must be resolvable through the Model package
- database and model configuration errors bubble up

## Type and numeric rules

### `alpha`

Letters only.

### `alphaNumeric`

Letters and digits only.

### `alphaDash`

Letters, underscores, and dashes only.

Digits are not accepted by this rule.

### `alphaSpace`

Letters, digits, and whitespace only.

### `numeric`

Uses `is_numeric()`.

### `integer`

Uses `FILTER_VALIDATE_INT`.

### `float`

Uses `FILTER_VALIDATE_FLOAT`.

Integer input also passes this rule.

### `boolean`

Accepts only this fixed set of values:

- `true`, `false`
- `1`, `0`
- `'true'`, `'false'`
- `'1'`, `'0'`
- `'yes'`, `'no'`
- `'on'`, `'off'`

### `minNumeric($number)`

Passes when both values are numeric and the input is greater than or equal to the minimum.

### `maxNumeric($number)`

Passes when both values are numeric and the input is less than or equal to the maximum.

## Length and membership rules

### `minLen(int $length)`

Checks multibyte string length with `mb_strlen()`.

### `maxLen(int $length)`

Checks multibyte string length with `mb_strlen()`.

### `exactLen(int $length)`

Checks multibyte string length with `mb_strlen()`.

### `contains(string $haystack)`

Checks whether the normalized input value appears anywhere inside the provided text.

Comparison is case-insensitive and trims both sides first.

### `containsList(string ...$list)`

Checks whether the normalized value matches one of the provided list items.

Comparison is case-insensitive and trims whitespace.

### `doesntContainsList(string ...$list)`

Inverse of `containsList()`.

## File rules

These rules expect the field value to be a `Quantum\Storage\UploadedFile` instance.

### `fileSize(int $maxSize, ?int $minSize = null)`

Checks byte size against a maximum and optional minimum.

If `minSize` is omitted, the lower bound becomes `0`.

### `fileMimeType(string ...$mimeTypes)`

Checks the detected MIME type of the uploaded file against the allowed list.

### `fileExtension(string ...$extensions)`

Checks the normalized file extension from the original uploaded filename.

### `imageDimensions(?int $width = null, ?int $height = null)`

Checks exact image dimensions when width and/or height are provided.

If you pass only one dimension, only that side is enforced.

This rule is for real image files. Non-image input can raise `FileUploadException` before the validator has a chance to add a normal validation error.

## URL and IP rules

### `url`

Requires a full valid URL.

### `urlExists`

First validates the URL, then checks whether the hostname resolves.

This is a DNS-level existence check, not an HTTP status check.

### `ip`

Accepts any valid IP address.

### `ipv4`

Accepts only IPv4 addresses.

### `ipv6`

Accepts only IPv6 addresses.
