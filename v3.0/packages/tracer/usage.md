# Using Tracer

Most applications only need to register the handler once during bootstrap.

## Register the handler

```php
use Quantum\Tracer\ErrorHandler;

$handler = new ErrorHandler();
$handler->setup($logger);
```

After that, PHP errors covered by `error_reporting()` are raised as `ErrorException`, and uncaught exceptions are routed through Tracer automatically.

## Send CLI output to an existing console stream

```php
$handler->setCliOutput($output);
```

Use this in console commands when you want Tracer to write failures into the same Symfony console output object your command already uses.

If you skip this step, Tracer creates its own `ConsoleOutput` instance.

## Customize severity resolution or trace formatting

`ErrorHandler` accepts optional collaborators in its constructor:

```php
$handler = new ErrorHandler(
    severityResolver: new ExceptionSeverityResolver(),
    stackTraceFormatter: new StackTraceFormatter(),
    webExceptionRenderer: new WebExceptionRenderer(),
);
```

This is useful when you need different severity rules or a custom web renderer without replacing the whole handler.

## What users see in production

### CLI

Production CLI output is intentionally brief:

```text
Database connection failed
```

### Web

Production web requests always return an HTTP 500 page. Tracer first tries to render `errors/500`. If that fails, it sends the plain text body `Internal Server Error`.

## What developers see in debug mode

### CLI

Debug CLI output includes:

- throwable class
- message
- source file and line
- full trace string

### Web

Debug web requests render `errors/trace` with:

- the exception message
- the resolved severity label
- a stack trace with source snippets when local filesystem access is available

## Practical caveats

- Make sure your project provides `errors/trace` and `errors/500` partials if you want custom error pages.
- Trace snippets rely on the local storage adapter because `StackTraceFormatter` reads files through `fs()`.
- Tracer does not choose status codes per exception type. Uncaught web exceptions are always rendered as 500 responses.
