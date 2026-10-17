# Lang

The Lang package adds simple file-based translations to a Quantum web app.

Use it when you want to:

- detect the active language from the request
- load translation files from shared or module resources
- fetch translated strings with a small helper API

It is intentionally lightweight. It does not provide pluralization rules, locale formatting, or a catalog compiler.

## Package shape

The package is built from four main parts:

- `Quantum\Lang\Factories\LangFactory` resolves one shared `Lang` instance
- `Quantum\Lang\Lang` stores the active language flag and delegates translation lookup
- `Quantum\Lang\Translator` loads translation files and resolves keys
- `src/Lang/Helpers/lang.php` exposes `current_lang()`, `t()`, and `_t()`

It also ships `LangException` for package-specific runtime failures.

## How language detection works

`LangFactory` loads `config/lang.php` and resolves the active language in this order:

1. `?lang=...` query parameter
2. configured URL segment from the request path
3. `Accept-Language` request header
4. `lang.default`

Only values present in `lang.supported` are accepted from the request. Unsupported request values are ignored and the factory falls back to `lang.default`.

The fallback itself is not checked against `lang.supported`. If `lang.default` is set, Quantum will use it even when it is not listed in the supported-language array.

## Where translations are loaded from

`Translator` looks for PHP files in these locations for the resolved language:

- `shared/resources/lang/<lang>/*.php`
- `modules/<current-module>/resources/lang/<lang>/*.php`

Files are imported under their file name, so `custom.php` becomes the `custom.*` namespace.

For example, this file:

```php
// shared/resources/lang/en/custom.php
return [
    'test' => 'Testing',
];
```

is read with:

```php
$value = t('custom.test');
```

## What happens at runtime

In a web request that matched a route, Quantum resolves the shared `Lang` instance before dispatching (`PrepareRequestStage` calls `LangFactory::get()`), so the language is detected once, from that request. Translations are not read at that point: the file adapter loads them on the first `t()` call and keeps them in memory for the rest of the container lifetime.

If a key is missing, `t()` returns the key string unchanged instead of throwing an exception.

## Important constraints

- If no shared or module translation files exist for the selected language, `load()` throws `LangException`.
- `Accept-Language` handling uses the first entry and resolves it to a two-letter language code.
- `Lang::setLang()` changes the reported current language, but it does not rebuild the underlying `Translator`. Changing the language after construction does not automatically switch translation files.
- `flush()` clears loaded translations, but it reloads using the translator's original language on the next `load()` call.
- The package only supports PHP array translation files.
