# Tracer Contracts

Tracer has a small public surface, but a few behaviors are important to rely on correctly.

## Handler setup contract

```php
$handler = new ErrorHandler();
$handler->setup($logger);
```

`setup()` must run before you expect Tracer to catch PHP errors or uncaught exceptions.

It also defines the logger used by the web production path. If no logger was set through `setup()`, production web failures still render a 500 page but skip logging.

## Severity resolution contract

`ExceptionSeverityResolver::resolve()` maps throwables to log levels like this:

- `ErrorException` uses its PHP severity when that severity exists in the package map
- `ParseError` resolves to `critical`
- `ReflectionException` resolves to `warning`
- everything else resolves to `error`

Known PHP severities map to `error`, `warning`, or `notice`.

## Logger method contract

`ErrorHandler` uses the resolved severity name as a logger method when that method exists:

```php
$logger->$errorType($message, ['trace' => $trace]);
```

If the logger does not implement that method, Tracer falls back to `error()`.

The logged context currently includes one key:

- `trace` => the throwable trace string

## HTTP response contract

The web path always sends an HTTP 500 response.

That is true for:

- rendered debug trace pages
- rendered production error pages
- the plain fallback `Internal Server Error` body used when rendering itself fails

Tracer does not inspect exception types to choose alternative status codes.

## Trace-view contract

In debug mode, `WebExceptionRenderer` renders `errors/trace` and passes three variables:

- `stackTrace`: array of formatted trace entries
- `errorMessage`: throwable message
- `severity`: capitalized severity label

Each `stackTrace` entry has this shape:

```php
[
    'file' => '/path/to/file.php',
    'code' => '<ol>...</ol>',
]
```

When source extraction is unavailable, `code` is an empty string rather than an exception.

## Source-snippet contract

`StackTraceFormatter` tries to show 10 lines around the target line.

The HTML is already escaped and wrapped in an ordered list. Consumers should treat it as preformatted HTML intended for direct rendering in the trace view.

The highlighted line is marked with:

- `error-line` for the original throwable location
- `switch-line` for later stack frames
