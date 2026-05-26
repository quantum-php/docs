# Renderer Contracts

## Core rendering contract

All renderer adapters implement:

```php
public function render(string $view, array $params = []): string;
```

Contract rules that affect usage:

- `$view` is a logical view name without the `.php` suffix
- `$params` is optional and is passed into the selected adapter
- rendering returns a string, not a response object

## Factory contract

`RendererFactory::get(?string $adapter = null)` resolves a `Quantum\Renderer\Renderer` instance.

### Resolution rules

- if the view config has not been loaded yet, the package imports it lazily
- when `$adapter` is `null`, the factory uses `view.default`
- `html` and `twig` are the built-in adapter names
- one renderer instance is cached per adapter name inside the factory service

## View lookup contract

Both built-in adapters resolve the view in this order:

1. `modules/<CurrentModule>/Views/<view>.php`
2. `shared/views/<view>.php`

If neither file exists, rendering throws a renderer exception.

Because module lookup happens first, a module can override a shared view with the same logical name.

For Twig usage, top-level logical names such as `dashboard` map most directly to the built-in adapter. The adapter sets the matched file's directory as Twig's loader root before rendering `dashboard.php`.

## Wrapper forwarding contract

`Quantum\Renderer\Renderer` is a proxy around the real adapter.

### `render(...)`

The public `render(...)` call is forwarded to the adapter.

### `getAdapter()`

Returns the underlying adapter instance.

Use it when you need adapter-specific integration behavior.

### Dynamic method calls

Other method calls are forwarded through `__call(...)`.

If the adapter does not implement the requested method, the package throws a renderer exception.

That makes adapter-specific calls opt-in and adapter-dependent.

## Adapter-specific data contract

### HTML adapter

- `$params` keys become extracted PHP variables inside the required template
- output is whatever the template prints to the output buffer

### Twig adapter

- `$params` becomes the Twig template context
- the adapter renders `<view>.php`, not `<view>.twig`
- Twig environment options come from `view.twig`

## Failure behavior

Expect these failure modes from normal usage:

- unsupported adapter name -> renderer exception
- missing view file -> renderer exception
- missing adapter method via `Renderer::__call(...)` -> renderer exception
- Twig syntax, loader, or runtime problems -> Twig exceptions
