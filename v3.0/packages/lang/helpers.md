# Lang Helpers

The package exposes three global helpers.

## `current_lang()`

```php
function current_lang(): ?string
```

Returns the current language string from the shared `Lang` instance.

Use it when you need the language code for routing, view logic, or response metadata.

## `t()`

```php
function t(string $key, $params = null): ?string
```

Returns the translated string for a key.

```php
$title = t('custom.test');
$message = t('custom.info', ['new']);
```

Behavior:

- reads from the shared language service used by the current app container
- returns the key unchanged when no translation exists
- applies placeholder substitution when `$params` is provided

`$params` can be a string or an array.

## `_t()`

```php
function _t(string $key, $params = null): void
```

Echoes the result of `t()` directly.

```php
_t('custom.test');
```

This is mainly convenient in views when you want immediate output instead of assigning a variable first.

## Helper caveats

- The helpers do not load translations by themselves. They rely on the shared `Lang` instance already being loaded, which normally happens during web app bootstrap when multilingual support is enabled.
- If translations were not loaded yet, lookups fall back to the key string.
- Helpers use the same shared language instance across the request/container lifecycle, so manual runtime changes to that instance affect later helper calls.
