# Debugger Contracts

The Debugger package exposes one explicit interface and one practical message contract used by the framework.

## `DebuggerStoreInterface`

`Quantum\Debugger\Contracts\DebuggerStoreInterface` defines the storage API behind `Debugger`.

### Methods

- `init(array $keys): void`
- `all()`
- `has(string $key): bool`
- `get(string $key)`
- `set(string $key, $value): void`
- `delete(string $key): void`
- `flush(): void`

## Current `DebuggerStore` behavior

`Quantum\Debugger\DebuggerStore` implements the interface with an in-memory static array.

### Initialization

`init($keys)` only creates missing keys. Existing cells are preserved.

That means calling `initStore()` multiple times is idempotent for already-created tabs.

### Reads and existence

- `has($key)` checks `isset(...)`
- `get($key)` returns the stored array or `[]`
- `all()` returns the full static store array

Because initialized cells always hold arrays, `has($key)` remains `true` even after `delete($key)` clears the cell.

### Writes

`set($key, $value)` only accepts array payloads in practice.

For each array entry, it appends a separate item:

```php
$store->set('messages', ['info' => 'ready']);
```

becomes:

```php
[
    'messages' => [
        ['info' => 'ready'],
    ],
]
```

This append-only shape is what `Debugger::createTab()` expects when it replays messages.

### Deletion

- `delete($key)` resets one cell to `[]`
- `flush()` resets the entire static store to `[]`

Neither method repopulates built-in tabs automatically.

## Message-level contract

`Debugger::addToStoreCell($cell, $level, $data)` stores values in a shape that is later interpreted as a collector method call.

So this write:

```php
$debugger->addToStoreCell('messages', 'warning', 'Disk nearly full');
```

is later replayed roughly as:

```php
$debugBar['messages']->warning('Disk nearly full');
```

The level string is therefore part of the runtime contract, not just metadata.

## Built-in tab contract

The package only renders five store-backed tabs:

- `messages`
- `queries`
- `routes`
- `hooks`
- `mails`

You can write to any key in `DebuggerStore`, but `Debugger::render()` only replays those built-in names.

If you need additional tabs, treat that as package customization rather than normal application usage.
