# Renderer Architecture

Renderer keeps template rendering deliberately thin.

## Runtime shape

A normal render flow looks like this:

1. `RendererFactory::get()` resolves an adapter name
2. the factory builds or reuses one `Renderer` for that adapter
3. `Renderer` forwards `render(...)` to the adapter instance
4. the adapter loads the matching view file and returns the rendered string

## Factory lifecycle

`RendererFactory::get(?string $adapter = null)` is the main entry point.

The factory is registered through the DI container the first time you use it.

Inside that factory service, one `Renderer` instance is cached per adapter name. In practice that means:

- repeated calls for the same adapter reuse the same wrapper and adapter objects
- switching adapter names creates a separate cached instance
- changing view config after an adapter has already been resolved does not refresh that cached adapter automatically

## Adapter resolution

The factory supports only the built-in adapter map:

- `html` -> `HtmlAdapter`
- `twig` -> `TwigAdapter`

Any other adapter name is rejected before instance creation.

## Shared wrapper behavior

`Quantum\Renderer\Renderer` does not implement its own rendering logic.

It stores one adapter implementing `TemplateRendererInterface` and forwards calls to that adapter.

This matters for two reasons:

- `render(...)` behavior is defined by the selected adapter
- calling an adapter-specific method through `Renderer` only works when that method actually exists on the resolved adapter

If you call a missing method, the package throws a renderer exception instead of failing silently.

## View resolution boundary

The package does not search arbitrary template paths.

Both built-in adapters look only in:

- the current module's `Views/` directory
- the shared `shared/views/` directory

If your application needs another source, you need to place files under those locations or provide a custom adapter implementation outside this package.
