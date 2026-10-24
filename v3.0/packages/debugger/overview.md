# Debugger

The Debugger package is Quantum's bridge to PHP DebugBar. When a layout renders the toolbar, it shows the matched route and view, the queries, the log messages, the mail transport log and the event listeners of the request, together with anything your code added.

The package is built around two pieces:

- `Quantum\Debugger\Debugger`, which owns the DebugBar instance, collects the data of the tabs and renders the toolbar
- `Quantum\Debugger\DebuggerStore`, which keeps the entries code writes directly with `addToStoreCell()`

## Entry points

### `debugbar()` helper

`debugbar()` lazily registers `Quantum\Debugger\Debugger` in the DI container and always returns the same container-managed instance for the current process.

That means every caller writes into the same `DebuggerStore` and the same underlying `DebugBar` instance.

### Tabs

The toolbar has five built-in tabs:

- `messages`
- `queries`
- `routes`
- `events`
- `mails`

The package needs no boot step: a tab exists from its first write. `debugbar()->initStore()` creates the five tabs empty up front if your code wants them before anything is written.

## Enablement

`Debugger::isEnabled()` reads `config()->get('app.debug')` and validates it with `FILTER_VALIDATE_BOOLEAN`.

Practical effect:

- truthy values such as `true`, `1`, or `'true'` enable rendering
- falsey values make `render()` return an empty string without collecting anything

## What the package collects

The package ships these default DebugBar collectors on construction:

- `PhpInfoCollector`
- `MessagesCollector`
- `RequestDataCollector`
- `TimeDataCollector`
- `MemoryCollector`

The five named tabs are filled when the toolbar renders; [Architecture](architecture.md#where-each-tabs-data-comes-from) shows where each tab's data comes from.

## Rendering

`render()` returns the DebugBar head assets and the toolbar markup, or an empty string when debugging is off. Quantum's default web module templates print it in the main layout with `<?= debugbar()->render() ?>`.

## Asset requirement

The renderer always points DebugBar assets at:

- base URL: `base_url() . '/assets/DebugBar/Resources'`
- extra stylesheet: `custom_debugbar.css`

The package does not publish those files by itself during normal request handling. Asset publishing is handled by the CLI command `install:debugbar`, which copies vendor DebugBar resources into `public/assets/DebugBar/Resources`.

## Important constraints

- The store is static in `DebuggerStore`, so data is process-scoped, not request-object-scoped.
- `addToStoreCell()` ignores empty payloads, so `''`, `[]`, `0`, and `'0'` are not recorded.
- The level of an entry is passed to `MessagesCollector::log()` and shown as its label; any string works.
