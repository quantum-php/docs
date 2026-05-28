# Tracer

Tracer is Quantum’s global error-handling layer.

Use it during bootstrap to convert PHP runtime errors into exceptions and send uncaught throwables through a consistent CLI or web response path.

## What it provides

- `ErrorHandler` for registration and runtime routing
- `ExceptionSeverityResolver` for logger severity selection
- `WebExceptionRenderer` for debug and production error views
- `StackTraceFormatter` for source snippets in debug trace pages

## Quick setup

```php
use Quantum\Tracer\ErrorHandler;

$handler = new ErrorHandler();
$handler->setup($logger);
```

## Runtime behavior

After setup:

- enabled PHP errors become `ErrorException` instances
- uncaught throwables are routed by runtime (`cli` or web)
- web requests return HTTP 500 for uncaught exceptions
- production web requests log the exception before rendering the response

## Debug and production output

- CLI debug: class, message, file/line, and full trace
- CLI production: exception message in the terminal output
- Web debug: `errors/trace` partial with formatted stack trace data
- Web production: `errors/500` partial

## Practical constraints

- Production logging happens in the web exception path.
- Uncaught web exceptions use a 500 response.
- Source snippets appear when the filesystem adapter can read local source files.

