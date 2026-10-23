# Logger Adapters

Logger ships with three adapters.

## `single`

`SingleAdapter` writes every accepted log entry to one configured file path.

### Expected config shape

The adapter expects `logging.single.path` to point to a file path, for example:

```php
[
    'path' => base_dir() . DS . 'storage' . DS . 'logs' . DS . 'app.log',
]
```

### Contract

At construction time, the adapter checks that the configured path looks like a file path (has an extension).

If it does not, the adapter throws `LoggerException::logPathIsNotFile(...)`.

The adapter does not pre-create directories for you; the target path must be writable by your runtime.

Use `single` when you want one append-only log file.

## `daily`

`DailyAdapter` writes to a file named after the current date inside a configured directory.

### Expected config shape

The adapter expects `logging.daily.path` to point to an existing directory, for example:

```php
[
    'path' => base_dir() . DS . 'storage' . DS . 'logs',
]
```

At runtime it writes to:

```text
<path>/<YYYY-MM-DD>.log
```

### Contract

At construction time, the adapter requires the configured path to already be a directory.

If it is not, the adapter throws `LoggerException::logPathIsNotDirectory(...)`.

The daily filename is chosen when the adapter instance is created. In long-running processes, rotate/re-resolve the logger after date rollover if you need strict day-boundary files.

Use `daily` when you want automatic file splitting by day.

## `message`

`MessageAdapter` is the logger of the web app in debug mode ([why only the web app](architecture.md#the-web-app-logs-to-message)). It writes no file: it keeps each message in memory as `[level => message]`, in the order they were logged, and `getMessages()` returns them ([example](usage.md#check-what-was-logged-in-debug-mode)). The debug toolbar reads them into its `messages` tab when it renders ([Debugger Architecture](../debugger/architecture.md#where-each-tabs-data-comes-from)).

The adapter keeps only the level and the message. The context is not used, so file-style formatting and `trace` appends are specific to the file adapters, and a `tab` key does not move a message to another toolbar tab; to add an entry to another tab, write to the debugger directly ([Debugger Usage](../debugger/usage.md#writing-to-a-specific-tab)).

### Expected config shape

A request that logs inside a loop can report thousands of lines, so the adapter keeps only the last ones. `logging.message.limit` sets how many:

```php
'message' => [
    'limit' => 1000,
],
```

Without the key the limit is `1000`. When the list grows past the limit, the oldest message is dropped; `0` keeps every message.

### Contract

- available only in debug mode
- takes the limit as its only constructor argument; the file-path config does not apply

Outside debug mode, explicitly requesting `message` causes the factory to throw an adapter-not-supported exception.

## File output format

Both file adapters use the same line format:

```text
[YYYY-MM-DD HH:MM:SS] Level: message
```

If you pass `['trace' => $trace]`, the trace is appended on the next line before the final newline.

If you pass an array message, the package JSON-encodes it with pretty printing before writing.