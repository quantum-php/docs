# Lang Helpers

The package exposes three global helpers. All three use the shared `Lang` instance of the default adapter (`lang.default`), resolved through `LangFactory::get()`.

## `current_lang()`

```php
function current_lang(): ?string
```

Returns the current language code of the shared `Lang` instance.

Use it when you need the language code for routing, view logic, or response metadata.

## `t()`

```php
function t(string $key, array|string $params = null): ?string
```

Returns the translated string for a key.

```php
$title = t('custom.test');
$message = t('custom.info', ['new']);
```

Behavior:

- the `file` adapter loads the translation files on the first call
- returns the key unchanged when no translation exists
- replaces `{%1}`, `{%2}`, ... placeholders when `$params` is provided; `$params` can be a string or an array

## `_t()`

```php
function _t(string $key, array|string $params = null): void
```

Echoes the result of `t()` directly.

```php
_t('custom.test');
```

This is mainly convenient in views when you want immediate output instead of assigning a variable first.

## Helper caveats

- With the `file` adapter, the first `t()` throws `Translation files not found.` when neither `shared/resources/lang/<lang>/` nor the current module has translation files.
- The helpers share one `Lang` instance per adapter for the container's lifetime, so `setLang()` on that instance changes the language of every later helper call.
