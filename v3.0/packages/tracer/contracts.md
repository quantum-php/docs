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

A deprecation (`E_DEPRECATED` or `E_USER_DEPRECATED`) is the exception. It only warns about a future PHP version, often from a library you do not control, so it should not stop the request. `handleError()` logs it with `warning()` as `<message> in <file>:<line>` and returns `true`, and the script goes on. When no logger is set, the deprecation is ignored.

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
