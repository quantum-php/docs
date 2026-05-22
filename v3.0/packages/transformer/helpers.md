# Transformer Helpers

## `transform()`

The package exposes one global helper:

```php
transform(array $data, TransformerInterface $transformer): array
```

It is a thin shortcut for `Quantum\Transformer\Transformer::transform()`.

```php
$payload = transform($users, new UserTransformer());
```

Use it when you want collection transformation without importing the static class explicitly.

## What the helper does not add

The helper does not change package behavior.

It does not:

- resolve transformers from the container
- accept class names or callbacks
- transform one item at a time
- catch transformer exceptions

If you need any of those behaviors, add them in your own application code around the helper.
