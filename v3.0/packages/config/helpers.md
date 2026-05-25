# Config Helpers

The package exposes one helper.

## `config()`

```php
function config(): Config
```

Use it when you want the shared configuration store managed by Quantum DI.

```php
use Quantum\Loader\Setup;

config()->import(new Setup('config', 'app'));

if (config()->has('app.debug')) {
    $debug = config()->get('app.debug');
}
```

Behavior:

1. checks whether `Config::class` is registered in DI
2. registers it if missing
3. returns the shared `Config` instance

## What that means in practice

- repeated `config()` calls reuse the same store
- values written with `set()` are visible through later helper calls
- `flush()` resets the same shared instance instead of creating a second store

If you need an isolated config store for a narrow task, instantiate `new Config()` yourself instead of using the helper.
