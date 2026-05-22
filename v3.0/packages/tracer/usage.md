# Using Tracer

Register Tracer once during bootstrap.

## Register the handler

```php
use Quantum\Tracer\ErrorHandler;

$handler = new ErrorHandler();
$handler->setup($logger);
```

## Attach CLI output when needed

```php
$handler->setCliOutput($output);
```

Use this in console commands to keep Tracer output on your existing Symfony output stream.

## Customize collaborators

```php
$handler = new ErrorHandler(
    severityResolver: new ExceptionSeverityResolver(),
    stackTraceFormatter: new StackTraceFormatter(),
    webExceptionRenderer: new WebExceptionRenderer(),
);
```

## Production behavior

### CLI

Prints message only.

### Web

Returns HTTP 500 and renders `errors/500`.
If view rendering fails, falls back to plain `Internal Server Error`.

## Debug behavior

### CLI

Prints class, message, file/line, and trace.

### Web

Renders `errors/trace` with message, severity, and formatted stack trace.

## Common pitfalls

- Missing `errors/trace` or `errors/500` partials causes fallback output.
- Trace snippets depend on local adapter access to source files.
- Tracer does not map exception types to custom HTTP status codes.
