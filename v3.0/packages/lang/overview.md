# Lang

The Lang package translates the text of a Quantum app into the visitor's language.

A visitor opens `/es/articles`, and the page shows "Leer más" instead of "Read more". Your views and controllers only ask for a key, `t('common.read_more')`; Lang works out the language from the request and returns the right text.

Use it when you want to:

- detect the active language from the request
- keep translations in PHP files, per language, shared or per module
- or translate text on the fly through DeepL or Google Translate
- read translated strings with a small helper API: `t()`, `_t()`, `current_lang()`

It does not provide pluralization rules, locale formatting, or a catalog compiler.

## Where translations come from

The text comes from an adapter, chosen with `lang.default` in `shared/config/lang.php`:

- `file`: your own translation files under `resources/lang/<lang>/`. This is the usual choice.
- `deepl`: the [DeepL](https://www.deepl.com/) API translates the text.
- `google_translate`: the Google Cloud Translation API translates the text.

The remote adapters can cache their answers through the Cache package, and they can start from your own files in one source language. See [Usage](usage.md#translate-with-deepl-or-google-translate).

## How language detection works

`LangFactory` resolves the active language in this order:

1. `?lang=...` query parameter
2. configured URL segment from the request path
3. `Accept-Language` request header
4. `lang.default_locale`

Only values present in `lang.supported` are accepted from the request. Unsupported request values are ignored and the factory falls back to `lang.default_locale`.

The fallback itself is not checked against `lang.supported`. If `lang.default_locale` is set, Quantum uses it even when it is not listed in the supported-language array.

## What happens at runtime

In a web request that matched a route, Quantum resolves the shared `Lang` instance before dispatching (`PrepareRequestStage` calls `LangFactory::get()`), so the language is detected once, from that request. Translations are not read at that point: the file adapter loads them on the first `t()` call and keeps them in memory for the rest of the container lifetime.

If a key is missing, `t()` returns the key string unchanged instead of throwing an exception.

## Package shape

- `Quantum\Lang\Factories\LangFactory` reads the config, detects the language and creates one `Lang` instance per adapter
- `Quantum\Lang\Lang` holds the current language and passes lookups to its adapter
- `Quantum\Lang\Adapters\FileAdapter`, `DeepLAdapter` and `GoogleTranslateAdapter` implement `Quantum\Lang\Contracts\LangAdapterInterface`
- `src/Lang/Helpers/lang.php` exposes `current_lang()`, `t()`, and `_t()`
- `Quantum\Lang\Exceptions\LangException` reports configuration and translation errors

## What to read next

- [Usage](usage.md)
- [Helpers](helpers.md)
- [Architecture](architecture.md)
