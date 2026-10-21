# Debugger Usage

Most applications only render the toolbar, and with `app.debug` on its tabs [fill themselves](architecture.md#where-each-tabs-data-comes-from). The API below adds your own entries.

## Basic logging

```php
debugbar()->addToStoreCell('messages', 'info', 'Booted module');
debugbar()->addToStoreCell('messages', 'warning', 'Slow downstream response');
```

Those entries are rendered into the `messages` tab when `app.debug` is enabled, before the messages the request logged with `logger()`.

## Writing to a specific tab

Quantum uses named tabs such as `queries`, `routes`, `events`, and `mails`.

```php
use Quantum\Debugger\Debugger;

debugbar()->addToStoreCell(Debugger::MAILS, 'warning', 'SMTP handshake failed');
```

This is the way to put an entry into a tab other than `messages`: the logger lists everything in `messages`.

Stick to the built-in tab constants; other tab names are not rendered.

## Rendering in a layout

```php
<?= debugbar()->render() ?>
```

When debugging is disabled, this returns an empty string.

When debugging is enabled, it returns both the renderer head assets and the toolbar markup, so it should only be emitted once per page.

If you call `render()` more than once on the same shared debugger instance, every entry is passed to the collectors again and appears twice in the toolbar.

## Custom collectors

`Debugger::__construct()` accepts an optional collector array.

If you pass a non-empty collector list, Quantum uses that list instead of the package defaults.

That means custom construction replaces the default collector set; it does not append to it automatically.

## Practical caveats

- Run `install:debugbar` before expecting the toolbar assets to load in the browser.
- `resetStore()` clears every entry written with `addToStoreCell()`.
- `clearStoreCell($cell)` empties a tab's stored entries but keeps the tab key available.
- `getStoreCell($cell)` returns only the entries written with `addToStoreCell()`. To read the request's log lines, use `logger()->getAdapter()->getMessages()`.
- Because the helper is DI-backed, mid-request config changes do not rebuild the debugger instance automatically.
