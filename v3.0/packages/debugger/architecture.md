# Debugger Architecture

When a layout calls `debugbar()->render()`, the toolbar is built from two sources: the entries your code wrote with `addToStoreCell()`, and what the debugger reads at that moment from the packages that own the data. Nothing is pushed into the debugger while the request runs; each package keeps its own state and does not reference the Debugger package.

Reading at render time needs no wiring: there is no listener to register and no boot step. A tab also shows what is true when the page renders, for example an event listener a controller added late in the request.

## Render flow

`Debugger::render()`:

1. returns an empty string when `app.debug` is off, without collecting anything
2. collects the entries of each tab from the packages (see below)
3. for each of the five tabs, gives the tab's `MessagesCollector` its stored entries first and the collected entries after them
4. returns `renderHead()` and `render()` output from the DebugBar JavaScript renderer

The collected entries go straight to the collectors. `render()` never writes them into the store and never clears it, so the store keeps only what code wrote into it directly.

## Where each tab's data comes from

| Tab | Collected from | Only when |
|---|---|---|
| `messages` | the debug-mode logger: `logger()->getAdapter()->getMessages()` | always in debug mode; the logger is built during boot for the error handler |
| `queries` | `Database::queryLog()`, one entry per query | the request started the database, it is still connected, and its adapter keeps a query log (SleekDB does not) |
| `routes` | the matched route (`request()->getMatchedRoute()`) and the last rendered view (`View::getViewFile()`) | a route matched or a view was rendered |
| `events` | `event()->getRegistered()` | at least one listener is registered |
| `mails` | the default mailer's `getTransportLog()` | the request used the mailer |

The debugger never builds a database connection or a mailer the request did not use.

The `routes` entry holds the route's methods, pattern, module, controller and action (`Closure` for a closure route), name, group, prefix, middlewares and params, plus the view path; values that are not set are left out:

```php
[
    'Methods' => 'GET',
    'Pattern' => '/[:alpha:2]?/posts',
    'Module' => 'Web',
    'Controller' => 'Modules\Web\Controllers\PostController',
    'Action' => 'posts',
    'Name' => 'posts',
    'Params' => ['_segment0' => 'en'],
    'View' => 'Web/Views/post/post',
]
```

The `mails` tab reads only the default mailer (`mailer()`), so the transport log of another adapter does not appear there; a failed send is also logged as a warning, which reaches the `messages` tab.

## Store model

`DebuggerStore` keeps the direct writes in a private static array:

```php
private static array $store = [];
```

Important consequences:

- all `DebuggerStore` instances share the same data
- `delete($key)` clears a cell to an empty array instead of removing the key
- `flush()` removes the entire store array
- `get($key)` returns `[]` when the key does not exist

## Collector replay

Each entry, stored or collected, has the shape `[$level => $data]`. `createTab()` creates a `MessagesCollector` for the tab if it does not exist yet and calls `log($level, $data)` for each entry.

The collectors live as long as the `Debugger` instance, so calling `render()` twice in one request hands them every entry again and the toolbar lists them twice.

Only the five built-in tab names are rendered. Writing to some other store key is only useful if you add your own render path around the package.
