# Debugger Architecture

The Debugger package follows a simple pipeline:

1. boot the shared debugger instance
2. initialize tab storage
3. let framework components append structured messages into store cells
4. replay those messages into DebugBar collectors during layout render

## Runtime flow

### 1. Boot stage

`Quantum\App\Stages\InitDebuggerStage` runs in the web app boot pipeline and calls `debugbar()->initStore()`.

In `Quantum\App\Adapters\WebAppAdapter`, that happens after helpers, environment, config, error handler, and HTTP initialization, but before modules are loaded.

### 2. Producers write into the store

Several framework components write diagnostics into the same store:

- `Quantum\Logger\Adapters\MessageAdapter` writes log messages into `messages` or a caller-provided tab
- `Quantum\App\Traits\WebAppTrait::logDebugInfo()` writes registered hooks into `hooks`
- `Quantum\View\View::updateDebugger()` rewrites the `routes` tab to include the resolved view file
- mailer code routes failures into the `mails` tab through logger helpers

Each write is appended as `[$level => $data]`.

## Store model

`DebuggerStore` keeps data in a private static array:

```php
private static array $store = [];
```

Important consequences:

- all `DebuggerStore` instances share the same data
- `delete($key)` clears a cell to an empty array instead of removing the key
- `flush()` removes the entire store array
- `get($key)` returns `[]` when the key does not exist

## Render model

`Debugger::render()` loops over the built-in tab names and calls `createTab($tab)` for each one.

That list is fixed to `messages`, `queries`, `routes`, `hooks`, and `mails`.

`createTab()`:

1. creates a `MessagesCollector` for the tab if it does not already exist
2. fetches stored messages for that tab
3. calls the collector method named by the stored level (`info`, `warning`, and so on)

Because the level name is executed as a method call, the write side and the collector API must stay in sync.

It also means store-backed custom tab names are not replayed automatically. Writing to some other cell is only useful if you add your own render path around the package.

## View-path merge behavior

The `routes` tab is not append-only.

`Quantum\View\View::updateDebugger()` reads the first existing `info` payload from `routes`, merges in:

```php
['View' => request()->getCurrentModule() . '/Views/' . $viewFile]
```

and then clears and rewrites the tab.

So the final `routes` payload is a merged structure, not a chronological list of route-related events.
