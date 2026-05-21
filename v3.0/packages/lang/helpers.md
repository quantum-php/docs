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

- resolves the shared `Lang` instance through `LangFactory`
- delegates to `Lang::getTranslation()`
- returns the key unchanged when no translation exists

`$params` can be a string or an array and is forwarded to `_message(...)`.

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
- Because the helpers use the shared factory-managed instance, any manual mutation on that instance affects later helper calls in the same container.
