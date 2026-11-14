# Config Usage

## Import a normal package config file

This is the pattern every Quantum factory uses: import the file once, then read from it.

```php
use Quantum\Config\Setup;

if (!config()->has('mailer')) {
    config()->import(new Setup('config', 'mailer'));
}

$defaultAdapter = config()->get('mailer.default');
$smtpHost = config()->get('mailer.smtp.host');
```

The `has()` check matters: importing the same section twice throws a `ConfigException`. A missing file throws too, which is what you want for config the code cannot work without.

For a file the app can run without, `importIfExists()` returns `false` instead of throwing.

## Load one file as the whole root store

```php
use Quantum\Config\Config;
use Quantum\Config\Setup;

$config = new Config();
$config->load(new Setup('config', 'app'));

$name = $config->get('name');
$debug = $config->get('debug', false);
```

Use this pattern for isolated tasks where one file should define the whole config payload.

## Reading booleans and numbers

A config value is whatever the PHP file put there, and often that is text. A line such as `'debug' => env('APP_DEBUG')` stores the string `'false'` when `.env` says `APP_DEBUG=false`, and PHP treats that string as true. Convert the value where you read it:

```php
$debug = config()->getBool('app.debug');
$limit = config()->getInt('mailer.transport_log_limit', 1000);
```

`getBool()` returns `true` for `true`, `1`, `on` and `yes`, in any letter case, and `false` for everything else, including an empty value. `getInt()` returns the number, and throws a `ConfigException` when the value is not a whole number, so a typo such as `abc` shows up at once instead of silently becoming `0`. When the key is missing, or its value is `null`, both return the default: `false` and `0` unless you pass another. `get()` keeps returning the raw value.

Both are methods of the `Config` class, so `config()` has them. They are available since 3.1.2; the exact rules are on the [contracts page](contracts.md#typed-reader-contract).

## Override values at runtime

You can add or replace values after loading.

```php
config()->set('mailer.smtp.host', 'smtp.internal');
config()->set('feature_flags.beta_checkout', true);
```

This updates the in-memory store only. It does not write back to the PHP config file.

## Remove or reset config

```php
config()->delete('feature_flags.beta_checkout');
config()->flush();
```

Use `flush()` carefully. It clears the whole shared store for the current runtime.

## Prefer one loading style per store

Mixing `load()` and `import()` is allowed, but the resulting key shape changes depending on which method populated the store first.

- after `load(new Setup('config', 'app'))`, keys look like `name` and `debug`
- after `import(new Setup('config', 'app'))`, keys look like `app.name` and `app.debug`

Pick one shape deliberately so the rest of your code reads the expected keys.

## Common pitfalls

### Calling `load()` twice

Later `load()` calls are ignored once the store has been initialized.

If you need a fresh root load, call `flush()` first or create a separate `Config` instance.

### Re-importing the same section name

This fails:

```php
config()->import(new Setup('config', 'app'));
config()->import(new Setup('config', 'app')); // throws
```

Use unique filenames per imported section.

### Assuming runtime changes persist to disk

`set()`, `delete()`, and `flush()` change the in-memory copy only.

