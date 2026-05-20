# Debugger

The Debugger package is Quantum's bridge to PHP DebugBar. It collects request-time diagnostics in an in-memory store and renders them into a debug toolbar at the end of a web response.

In current core code, the package is built around two pieces:

- `Quantum\Debugger\Debugger`, which owns the DebugBar instance and rendering flow
- `Quantum\Debugger\DebuggerStore`, which keeps per-process tab data until render time

## Entry points

### `debugbar()` helper

`debugbar()` lazily registers `Quantum\Debugger\Debugger` in the DI container and always returns the same container-managed instance for the current process.

That means every caller writes into the same `DebuggerStore` and the same underlying `DebugBar` instance.

### Boot-time initialization

Web apps initialize the package through `Quantum\App\Stages\InitDebuggerStage`, which calls:

```php
debugbar()->initStore();
```

`initStore()` creates five built-in tabs:

- `messages`
- `queries`
- `routes`
- `hooks`
- `mails`

The store is still tolerant of missing keys because reads fall back to `[]`, but this boot stage is what pre-seeds the standard tabs used by the rest of the framework.

## Enablement

`Debugger::isEnabled()` reads `config()->get('app.debug')` and validates it with `FILTER_VALIDATE_BOOLEAN`.

Practical effect:

- truthy values such as `true`, `1`, or `'true'` enable rendering and logging
- falsey values return an empty string from `render()` and make framework log adapters skip writes

## What the package collects

The package ships these default DebugBar collectors on construction:

- `PhpInfoCollector`
- `MessagesCollector`
- `RequestDataCollector`
- `TimeDataCollector`
- `MemoryCollector`

Framework integrations then add package-specific messages into named tabs:

- logger messages go to `messages` by default
- mail failures can be routed to `mails`
- web bootstrap stores registered hooks in `hooks`
- view rendering updates the `routes` tab with the final view path

## Rendering contract

`render()` does three things when debugging is enabled:

1. ensures each built-in tab has a `MessagesCollector`
2. replays stored messages into the matching collector
3. returns `renderHead()` and `render()` output from the DebugBar JavaScript renderer

Quantum's default web module templates print that HTML directly in the main layout with `<?= debugbar()->render() ?>`.

## Asset requirement

The renderer always points DebugBar assets at:

- base URL: `base_url() . '/assets/DebugBar/Resources'`
- extra stylesheet: `custom_debugbar.css`

The package does not publish those files by itself during normal request handling. Asset publishing is handled by the CLI command `install:debugbar`, which copies vendor DebugBar resources into `public/assets/DebugBar/Resources`.

## Important constraints

- The store is static in `DebuggerStore`, so data is process-scoped, not request-object-scoped.
- `render()` does not clear the store after output.
- `addToStoreCell()` ignores empty payloads, so `''`, `[]`, `0`, and `'0'` are not recorded.
- Message levels are invoked dynamically on `MessagesCollector`; unsupported level names would fail at call time.
