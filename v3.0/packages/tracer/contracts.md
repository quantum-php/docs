# Tracer Contracts

This page lists behavior you can rely on when integrating Tracer.

## Setup contract

```php
$handler = new ErrorHandler();
$handler->setup($logger);
```

`setup()` must run before Tracer can intercept PHP errors and uncaught exceptions.

## Error conversion contract

`handleError()` converts enabled PHP errors into `ErrorException`.

Suppressed or masked severities are ignored (`false` return), so `@` suppression still works.

## Severity mapping contract

`ExceptionSeverityResolver::resolve()` maps:

- `ParseError` → `critical`
- `ReflectionException` → `warning`
- other throwables → `error`
- `ErrorException` uses mapped PHP severity when available

## Logging contract

In web production flow, Tracer logs with resolved severity method when available, otherwise `error()`.

Context includes throwable trace text.

## Web response contract

Uncaught web exceptions always produce HTTP 500.

Tracer attempts to render:

- debug: `errors/trace`
- production: `errors/500`

If rendering fails, fallback response body is `Internal Server Error` with status 500.

## Trace view contract

In debug mode, `errors/trace` receives:

- `stackTrace`
- `errorMessage`
- `severity`

`stackTrace` entries include file path and preformatted code snippet HTML when available.
