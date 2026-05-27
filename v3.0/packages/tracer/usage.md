# Using Tracer

Register Tracer once during bootstrap.

## Register the handler

```php
use Quantum\Tracer\ErrorHandler;

$handler = new ErrorHandler();
$handler->setup($logger);
```

This wires PHP error handling and uncaught exception handling through the same Tracer instance.

## Attach CLI output when needed

```php
$handler->setCliOutput($output);
```

Use this in console commands when you want Tracer to write to the same Symfony output stream as the rest of the command. Without an injected output, Tracer writes to Symfony `ConsoleOutput`.

## Customize collaborators

```php
$handler = new ErrorHandler(
    severityResolver: new ExceptionSeverityResolver(),
    stackTraceFormatter: new StackTraceFormatter(),
    webExceptionRenderer: new WebExceptionRenderer(),
);
```

Use custom collaborators when you want to adjust severity mapping, debug trace formatting, or web error-page rendering while keeping the same top-level handler API.

## Production behavior

### CLI

Tracer prints the exception message for terminal-friendly output.

### Web

Tracer returns HTTP 500 and renders `errors/500`. When the error partial is unavailable, Tracer sends a plain `Internal Server Error` response.

## Debug behavior

### CLI

Tracer prints the exception class, message, file/line, and trace.

### Web

Tracer renders `errors/trace` with the exception message, severity label, and formatted stack trace.

## Common pitfalls

- Keep `errors/trace` and `errors/500` partials available in the active view layer when you want framework-styled error pages.
- Trace snippets appear when the storage filesystem adapter can read local source files.
- Treat Tracer as a 500-level exception handler and keep custom HTTP status responses in your application flow.
