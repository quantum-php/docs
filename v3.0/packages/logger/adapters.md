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

`MessageAdapter` sends accepted log entries to Quantum's debugger message store instead of the filesystem.

### How tab routing works

The adapter uses:

- `Debugger::MESSAGES` by default
- `context['tab']` when you pass one

Example:

```php
logger()->info('Mailer connected', ['tab' => 'mails']);
```

The debugger store receives the level and raw message as separate values. File-style formatting and `trace` appends are specific to the file adapters.

### Contract

- available only in debug mode
- writes only when `debugbar()->isEnabled()` is true
- ignores file-path config because it has no constructor parameters

Outside debug mode, explicitly requesting `message` causes the factory to throw an adapter-not-supported exception.

## File output format

Both file adapters use the same line format:

```text
[YYYY-MM-DD HH:MM:SS] Level: message
```

If you pass `['trace' => $trace]`, the trace is appended on the next line before the final newline.

If you pass an array message, the package JSON-encodes it with pretty printing before writing.