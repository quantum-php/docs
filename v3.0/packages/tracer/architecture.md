# Tracer Architecture

Tracer runs as a short pipeline:

1. register handlers
2. convert runtime PHP errors to exceptions
3. route uncaught throwables to CLI or web flow
4. print or render the final error output

## Registration

`ErrorHandler::setup()` registers both error and exception handlers on the same instance.

## CLI flow

For `PHP_SAPI === 'cli'`:

- output goes to injected CLI output (or default `ConsoleOutput`)
- production prints message only
- debug prints expanded error details and trace

## Web flow

For non-CLI runtime:

- severity is resolved from throwable
- production path logs exception
- renderer returns HTTP 500 response (`errors/trace` or `errors/500`)
- fallback is plain `Internal Server Error` if rendering fails

## Trace formatting

`StackTraceFormatter` builds source excerpts around trace lines.

Notes:

- Handler-internal frames are skipped for cleaner output.
- Source snippets require local filesystem access through `fs()`.
