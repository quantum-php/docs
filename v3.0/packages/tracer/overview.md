# Tracer

The Tracer package is Quantum's top-level error handling layer. It turns PHP errors into exceptions, chooses a response path for CLI vs web requests, and renders either a minimal production failure or a developer-focused trace page.

Use it when you need one place to register framework error handling for both console commands and HTTP requests.

## What it covers

The package is built from four pieces:

- `Quantum\Tracer\ErrorHandler` registers the PHP error and exception handlers
- `Quantum\Tracer\ExceptionSeverityResolver` maps exceptions to log levels
- `Quantum\Tracer\WebExceptionRenderer` renders the web error page
- `Quantum\Tracer\StackTraceFormatter` builds the code snippets shown on the debug trace page

## When to use it

Reach for Tracer when you want to:

- convert PHP runtime errors into catchable exceptions
- send clean error output to CLI commands in production
- render a stack-trace page in web debug mode
- log production web exceptions through the framework logger

## Runtime behavior at a glance

```php
use Quantum\Tracer\ErrorHandler;

$handler = new ErrorHandler();
$handler->setup($logger);
```

After `setup()` runs:

- PHP errors handled by `error_reporting()` are converted into `ErrorException`
- uncaught throwables are routed to CLI or web handling based on `PHP_SAPI`
- web requests render an HTTP 500 response
- production web requests log the exception before rendering the error page

## Debug vs production output

Tracer changes behavior based on `is_debug_mode()`:

- **CLI + debug on:** prints class name, message, file, line, and full trace
- **CLI + debug off:** prints only the exception message
- **Web + debug on:** renders the `errors/trace` partial with stack trace snippets
- **Web + debug off:** logs the exception and renders the `errors/500` partial

## Important constraints

- Logging only happens in the web production path. CLI exceptions are printed, not logged, by `ErrorHandler`.
- `handleError()` ignores suppressed or masked severities and returns `false` in that case.
- Debug trace snippets depend on the active storage adapter being local. Non-local storage produces the trace page without source-code excerpts.
- If the trace or 500 view cannot be rendered, Tracer falls back to a plain `Internal Server Error` response.

For setup and flow details, see [Architecture](architecture.md). For severity mapping and output contracts, see [Contracts](contracts.md). For integration examples, see [Usage](usage.md).
