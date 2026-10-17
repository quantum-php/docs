# Lang Architecture

The package has three layers: `LangFactory` builds a `Lang` per adapter, `Lang` holds the current language, and an adapter turns a key into text.

## Shared instance lifecycle

`LangFactory::get(?string $adapter = null)` is the main entry point.

On each call it:

1. registers `LangFactory` in the DI container if needed and resolves it
2. imports `config/lang.php` when the `lang` config key is not present yet
3. takes the adapter name from the argument or from `lang.default`
4. detects the language from the request
5. returns the cached `Lang` for that adapter, creating it on the first call

The language is detected on every call but used only when the instance is created. After that, the instance keeps its language until `setLang()` changes it.

`file` adapters are created with the language and the `lang.file` block. `deepl` and `google_translate` adapters also get a new `HttpClient`.

## Detection details

### Query parameter

`?lang=<value>` has highest priority.

### URL segment

The URL strategy reads `request()->getSegment((int) config()->get('lang.url_segment'))`.

There is one routing-specific adjustment: when the current route has a prefix and `lang.url_segment` is `1`, the factory increments the segment index to `2`. That keeps the language lookup aligned with prefixed routes.

### Header fallback

Header-based detection reads the first `Accept-Language` entry and keeps its first two characters, lowercased.

Example: `es-ES, en;q=0.8` resolves to `es`.

### Default

`lang.default_locale` is used as-is. It does not need to appear in `supported`, because the supported list is only applied to request-derived values. If it is empty too, the factory throws `LangException::misconfiguredDefaultConfig()`.

## `Lang`

`Lang` stores the current language and the adapter.

- `setLang()` updates both: the reported language and the adapter's language
- `getTranslation()` asks the adapter
- any other method call is forwarded to the adapter, or throws `LangException::methodNotSupported()` when the adapter does not have it

## File adapter

Translations are loaded on the first `get()` and kept until `flush()` or a language change.

Loading order is:

1. shared translation files: `shared/resources/lang/<lang>/*.php`
2. current module translation files: `modules/<module>/resources/lang/<lang>/*.php`

Each file is required and imported under its basename. That means this structure:

- `shared/resources/lang/en/messages.php`
- `modules/Blog/resources/lang/en/messages.php`

loads both files into the `messages` namespace. Because module files are imported after shared files, later imports can replace or extend earlier values for the same file/key paths.

When neither location has a file, loading throws `LangException::translationsNotFound()`.

`setLang()` with a different language clears the loaded translations, so the next lookup loads the new language.

## Remote adapters

`DeepLAdapter` and `GoogleTranslateAdapter` share `RemoteAdapterTrait`. A lookup goes through these steps:

1. **Source text.** Without a source catalog, the key with its placeholders filled is the text. With `use_source_catalog`, a `FileAdapter` in `source_locale` provides the text for the key.
2. **Bypass.** An empty text is returned as is. With a source catalog, so is a key that has no source text, and any lookup whose language equals `source_locale`.
3. **Cache.** With `cache.enabled`, the answer is looked up in the configured cache adapter under `prefix` + a hash of adapter, language, source locale and text.
4. **Request.** The text is sent to the provider (`target_lang` in upper case for DeepL, with `source_lang` / `source` when `source_locale` is set). The URL can be overridden with an `api_url` key in the adapter block.
5. **Store.** The translation is cached for `ttl` seconds and returned.

## Translation lookup contract

With the `file` adapter, `t($key, $params)` behaves like this:

- if the key exists, return the translated string
- if params are passed, apply placeholder substitution
- if the key does not exist, return the original key

Missing keys fall back to the key string (not `null`). With a remote adapter, the result is the provider's translation of the source text described above.
