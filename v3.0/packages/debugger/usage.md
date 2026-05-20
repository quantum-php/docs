# Debugger Usage

Most applications use the Debugger package indirectly through Quantum's web stack, but the underlying API is small enough to use directly.

## Basic logging

```php
debugbar()->addToStoreCell('messages', 'info', 'Booted module');
debugbar()->addToStoreCell('messages', 'warning', 'Slow downstream response');
```

Those entries are rendered into the `messages` tab when `app.debug` is enabled.

## Writing to a specific tab

Quantum uses named tabs such as `queries`, `routes`, `hooks`, and `mails`.

```php
use Quantum\Debugger\Debugger;

debugbar()->addToStoreCell(Debugger::MAILS, 'warning', 'SMTP handshake failed');
```

You can also route logger output into a tab by passing a `tab` context value to the framework's message logger path.

## Rendering in a layout

```php
<?= debugbar()->render() ?>
```

When debugging is disabled, this returns an empty string.

When debugging is enabled, it returns both the renderer head assets and the toolbar markup, so it should only be emitted once per page.

## Custom collectors

`Debugger::__construct()` accepts an optional collector array.

If you pass a non-empty collector list, Quantum uses that list instead of the package defaults.

That means custom construction replaces the default collector set; it does not append to it automatically.

## Practical caveats

- Run `install:debugbar` before expecting the toolbar assets to load in the browser.
- `resetStore()` clears all tabs for the shared store.
- `clearStoreCell($cell)` empties a tab but keeps the tab key available.
- Because the helper is DI-backed, mid-request config changes do not rebuild the debugger instance automatically.
