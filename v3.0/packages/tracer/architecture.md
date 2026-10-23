# Tracer Architecture

Tracer runs as a short pipeline:

1. register handlers
2. convert runtime PHP errors to exceptions
3. route uncaught throwables to CLI or web flow
4. print or render the final error output

The flow in step 3 follows the app that was booted ([`is_console_app()`](../app/helpers.md#is_web_app-and-is_console_app)), so `php qt` gets terminal output, and a request gets an error page, whether PHP-FPM or `php qt serve` serves it.

## Registration

`ErrorHandler::setup()` registers both error and exception handlers on the same instance. Call it once during bootstrap so the same handler owns both flows.

## CLI flow

For the console app:

- output goes to the injected CLI output, or to Symfony `ConsoleOutput` when you do not provide one
- production prints the exception message for compact terminal output
- debug prints the exception class, message, file/line, and trace

## Web flow

For the web app:

- severity is resolved from the throwable before logging
- production requests log through the matching logger method when available, with `error()` as the fallback method
- renderer returns an HTTP 500 response by rendering `errors/trace` in debug mode or `errors/500` in production
- when view rendering is unavailable, Tracer sends a plain `Internal Server Error` response

## Trace formatting

`StackTraceFormatter` builds source excerpts around trace lines for the debug view.

Notes:

- Handler-owned frames are skipped so the trace starts closer to application code.
- Source snippets appear when `fs()` is backed by a local filesystem adapter.
