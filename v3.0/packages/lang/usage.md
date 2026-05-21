# Lang Usage

## Configure supported languages

Create `shared/config/lang.php` with the language settings the factory expects:

```php
return [
    'enabled' => true,
    'supported' => ['en', 'es'],
    'default' => 'en',
    'url_segment' => 1,
];
```

Practical notes:

- `enabled` controls whether web bootstrap loads translations
- `supported` is the allowlist for query, URL, and header detection
- `default` is the required fallback when request detection yields no supported language
- `url_segment` is the URL segment index used for language detection (for example, `1` for `/es/articles`)

## Add translation files

Place translation files under the shared resources directory:

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

## Add module-specific translations

Modules can ship their own translations under:

```text
modules/<Module>/resources/lang/<lang>/
```

This works only when the current request is matched to a module route, because the translator uses `request()->getCurrentModule()` to build the module path.

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

If none of those produce a supported value, Quantum uses `lang.default`.

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

## Reload translations after a manual reset

```php
use Quantum\Lang\Factories\LangFactory;

$lang = LangFactory::get();
$lang->flush();
$lang->load();
```

Use this only when you intentionally need to clear the in-memory translation store. It is not a language-switching API.

## Caveats to keep in mind

- `setLang()` updates the visible language code, not the translator source language.
- Missing translation files fail loudly during `load()`, but missing keys do not.
- Only the active module is scanned for module translations during a request.
- Header detection uses only the primary two-letter language code from the first `Accept-Language` entry.
