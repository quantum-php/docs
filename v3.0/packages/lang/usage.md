# Lang Usage

## Configure the languages

`shared/config/lang.php` names the adapter, the languages you accept, and the fallback:

```php
return [
    'supported' => ['en', 'es'],
    'default' => 'file',
    'default_locale' => 'en',
    'url_segment' => 1,
    'file' => [],
];
```

- `supported` is the allowlist for query, URL, and header detection
- `default` selects the adapter: `file`, `deepl` or `google_translate`
- `default_locale` is the language used when the request gives no supported one
- `url_segment` is the URL segment index used for language detection (for example, `1` for `/es/articles`)
- each adapter reads its own block, named after it (`file`, `deepl`, `google_translate`)

A missing or empty `default` throws `Misconfigured lang default adapter config.`, an unknown adapter name throws ``The adapter `<name>` is not supported.``, and no language at all (nothing detected and no `default_locale`) throws `Misconfigured lang default config.`

## Add translation files

With the `file` adapter, place translation files under the shared resources directory:

```php
// shared/resources/lang/en/custom.php
return [
    'test' => 'Testing',
    'info' => 'Information about the {%1} feature',
];
```

Then read them with the file name plus key path:

```php
echo t('custom.test');
echo t('custom.info', ['new']);
```

Each `{%1}`, `{%2}`, ... placeholder takes the next value from the params array.

## Add module-specific translations

Modules can ship their own translations under:

```text
modules/<Module>/resources/lang/<lang>/
```

They are loaded after the shared files, so a module file with the same name can add or replace keys. This works only when the current request is matched to a module route, because the adapter uses `request()->getCurrentModule()` to build the module path.

If neither the shared nor the module directory has a file for the active language, the first `t()` call throws `Translation files not found.`

## Use request-driven language detection

The package accepts three request-driven inputs:

### Query string

```text
/articles?lang=es
```

### URL segment

With `url_segment => 1`:

```text
/es/articles
```

### Accept-Language header

```http
Accept-Language: es, en;q=0.8
```

If none of those produce a supported value, Quantum uses `lang.default_locale`.

## Use translations in application code

```php
$current = current_lang();

if ($current === 'es') {
    $label = t('custom.learn_more');
}
```

In views, `_t()` can output directly:

```php
<button><?php _t('custom.learn_more'); ?></button>
```

## Switch the language in code

The detected language is a starting point. To answer in another language, for example the one stored on the user's profile, set it on the shared instance:

```php
use Quantum\Lang\Factories\LangFactory;

LangFactory::get()->setLang('es');

echo t('custom.test'); // from shared/resources/lang/es/custom.php
```

With the `file` adapter, changing the language drops the loaded translations, and the next `t()` loads the files of the new language.

## Translate with DeepL or Google Translate

Set `default` to `deepl` or `google_translate` and fill in that adapter's block:

```php
return [
    'supported' => ['en', 'es', 'de'],
    'default' => 'deepl',
    'default_locale' => 'en',
    'url_segment' => 1,
    'deepl' => [
        'use_source_catalog' => false,
        'auth_key' => env('DEEPL_AUTH_KEY'),
        'source_locale' => null,
        'cache' => [
            'enabled' => true,
            'default' => 'file',
            'ttl' => 3600,
            'prefix' => 'lang_deepl:',
        ],
    ],
];
```

The `google_translate` block has the same keys, with `api_key` instead of `auth_key`.

What gets translated depends on `use_source_catalog`:

- **`false`:** the key itself is the text. `t('Welcome back, {%1}!', [$name])` fills the placeholder and sends `Welcome back, Anna!` to the provider.
- **`true`:** the text comes from your translation files in `source_locale`, so `t('custom.test')` reads `custom.test` from `resources/lang/en/` and sends that. A key with no source text, or a request whose language is the source language itself, is answered from the files without calling the provider. `source_locale` is required in this mode.

With `cache.enabled`, every answer is stored through the Cache package adapter named in `cache.default`, for `ttl` seconds, so the same text in the same language is sent to the provider only once.

Errors to expect:

- no `auth_key` / `api_key`: ``Could not load config `lang.deepl.auth_key` properly.`` (or `lang.google_translate.api_key`), the first time a text has to be sent to the provider
- the request fails: ``The translation request to `Quantum\Lang\Adapters\DeepLAdapter` failed: <provider response>.``
- the provider answers with something else than a translation: ``The provider `DeepL` returned an invalid translation response.``

## Clear the loaded translations

```php
use Quantum\Lang\Factories\LangFactory;

LangFactory::get()->flush();
```

With the `file` adapter, the next `t()` reads the files again. The remote adapters have no `flush()`; calling it on them throws ``The method `flush` is not supported for `...`.``

## Caveats to keep in mind

- Missing translation files fail on the first `t()`, but missing keys do not.
- Only the active module is scanned for module translations during a request.
- Query and URL detection require an exact supported-language match; only the header fallback is normalized to a primary two-letter code.
