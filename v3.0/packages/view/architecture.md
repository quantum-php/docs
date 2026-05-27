# View Architecture

The View package sits on top of Renderer and coordinates the rest of the page-rendering pipeline.

## Main components

### `View`

`Quantum\View\View` owns request-time rendering state:

- the current layout file
- accumulated view params
- layout asset definitions collected through `setLayout()`
- the last rendered page body from a full page render

It does not resolve template files itself. It always delegates the final template render to `Renderer`.

### `ViewFactory`

`ViewFactory::get()` is the standard entry point.

It resolves the view service through DI and memoizes one `View` instance inside the factory. In practice, repeated `view()` calls during the same container lifecycle return the same object.

That shared-instance behavior matters because layout, params, and layout asset definitions are mutable state, not one-shot method arguments.

### `RawParam`

`RawParam` is the package's explicit escape hatch.

If a param is wrapped in `RawParam`, the View package skips HTML escaping for that value and returns the original payload to the renderer.

## Full render flow

`render()` follows this sequence:

1. require a layout to be set
2. merge any runtime params into the existing param bag
3. render the page view through the renderer
4. register layout assets, if any were attached through `setLayout()`
5. update debugger route metadata when the debugger is enabled
6. render the layout through the renderer
7. optionally cache the final layout HTML by request URI when view cache is enabled

The body view renders before the layout. Layout templates can then read the rendered body through `getContent()`.

When view cache is enabled, the package still renders the page and layout first. It then stores the final HTML under the current request URI and returns the cached copy for that URI.

## Partial render flow

`renderPartial()` is deliberately smaller.

It merges params into the shared param bag and renders the requested file. It does not require a layout and does not trigger asset registration, debugger updates, or view-cache writes.

## Escaping boundary

Before each render, the package recursively escapes strings with `htmlspecialchars(..., ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8')`.

Practical effect:

- normal strings are safe by default for HTML output
- nested arrays are escaped too
- object properties are escaped in place
- raw values must be marked intentionally

Because object properties are updated during filtering, do not pass reusable mutable objects if you need to preserve their original string values elsewhere.

## Integration points

The package relies on other packages for surrounding concerns:

- Renderer: template adapter and file lookup
- Asset: registers layout assets before layout render
- Debugger: records the rendered view path when enabled
- ResourceCache: caches final layout output by request URI
