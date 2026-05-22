# Tracer

Tracer is Quantum’s global error-handling layer.

Use it to convert PHP errors into exceptions and render consistent failure output for CLI and web requests.

## What it provides

- `ErrorHandler` for registration and exception routing
- `ExceptionSeverityResolver` for log-level mapping
- `WebExceptionRenderer` for debug/prod web error pages
- `StackTraceFormatter` for debug trace snippets

## Quick setup

```php
use Quantum\Tracer\ErrorHandler;

$handler = new ErrorHandler();
$handler->setup($logger);
```

## Runtime behavior

After setup:

- enabled PHP errors are converted to `ErrorException`
- uncaught throwables are routed by runtime (`cli` vs web)
- web failures return HTTP 500
- production web failures are logged before rendering

## Debug vs production output

- CLI debug: class, message, file/line, full trace
- CLI production: message only
- Web debug: trace page (`errors/trace`)
- Web production: error page (`errors/500`)

## Practical constraints

- Logging is done in web production flow.
- Web status code for uncaught exceptions is always 500.
- Trace code snippets require local filesystem access.

## Read next

- [Usage](usage.md)
- [Contracts](contracts.md)
- [Architecture](architecture.md)
