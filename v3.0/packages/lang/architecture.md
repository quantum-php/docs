# Lang Architecture

The Lang package uses a small factory-plus-translator model.

## Shared instance lifecycle

`LangFactory::get()` is the main entry point.

On first use it:

1. registers `LangFactory` in the DI container if needed
2. resolves the factory from DI
3. memoizes one `Lang` instance inside the factory

Repeated calls return the same `Lang` object until the container or factory state is reset.

## Config loading

The factory lazily imports `config/lang.php` when the `lang` config key is not already present.

It expects these settings:

- `enabled`
- `supported`
- `default`
- `url_segment`

If no usable language can be detected and `default` is empty, the factory throws `LangException::misconfiguredDefaultConfig()`.

## Detection details

### Query parameter

`?lang=<value>` has highest priority.

### URL segment

The URL strategy reads `request()->getSegment((int) config()->get('lang.url_segment'))`.

There is one routing-specific adjustment: when the current route has a prefix and `lang.url_segment` is `1`, the factory increments the segment index to `2`. That keeps the language lookup aligned with prefixed routes.

### Header fallback

Header detection uses `server()->acceptedLang()`, which:

- reads `HTTP_ACCEPT_LANGUAGE`
- takes only the first comma-separated entry
- lowercases it
- keeps only the first two characters

So `es-ES, en;q=0.8` becomes `es`.

## Translation loading model

`Translator::loadTranslations()` is idempotent. Once translations are loaded, later calls return immediately until `flush()` is called.

Loading order is:

1. shared translation files
2. current module translation files

Both locations are scanned with `*.php` globbing. Each file is required and imported under its basename.

That means this structure:

- `shared/resources/lang/en/messages.php`
- `modules/Blog/resources/lang/en/messages.php`

loads both files into the `messages` namespace. Because module files are imported after shared files, later imports can replace or extend earlier values for the same file/key paths.

## Translation lookup contract

`Translator::get($key, $params)` behaves like this:

- if the key exists, return the stored string
- if params were passed, run the value through `_message(...)`
- if the key does not exist, return the original key

The package does not return `null` for a missing translation key in normal lookup flow.

## Stateful caveat: reported lang vs translator lang

`Lang` stores the current language string and the `Translator` as separate state.

- `setLang()` updates only `Lang::$currentLang`
- the existing `Translator` keeps the language string it was constructed with

So this is not a full language switch:

```php
$lang = LangFactory::get();
$lang->setLang('es');
```

After that, `current_lang()` reports `es`, but already-wired translation loading still points at the translator's original language unless you rebuild the Lang instance.
