# Tracer Architecture

Tracer follows a short pipeline:

1. register the handler
2. convert PHP errors into `ErrorException`
3. dispatch uncaught throwables to CLI or web handling
4. render or print the final failure output

## Registration

`ErrorHandler::setup(Logger $logger)` stores the logger and registers:

- `set_error_handler([$this, 'handleError'])`
- `set_exception_handler([$this, 'handleException'])`

That makes the same `ErrorHandler` instance responsible for both PHP runtime errors and uncaught exceptions.

## Error conversion

`handleError()` checks whether the incoming severity is still enabled by `error_reporting()`.

If the severity is active, it throws `ErrorException`. If the severity is suppressed, it returns `false` and lets PHP continue its normal flow.

Practical result: operators like `@` still suppress those errors because the handler respects masked severities.

## CLI flow

For `PHP_SAPI === 'cli'`, `handleException()` calls `handleCliException()`.

The CLI path writes to:

- the output passed through `setCliOutput()`, or
- a new Symfony `ConsoleOutput` when no custom output was injected

Debug mode controls how much detail is printed:

- production: message only
- debug: class, message, file, line, and full trace

## Web flow

For non-CLI execution, `handleException()` calls `handleWebException()`.

The web path does three things:

1. resolve an error type through `ExceptionSeverityResolver`
2. log the exception when debug mode is off
3. render an HTTP 500 page through `WebExceptionRenderer`

If rendering fails for any reason, the handler still sends a plain `Internal Server Error` response with status `500`.

## Renderer flow

`WebExceptionRenderer::render()` switches on debug mode:

- debug mode renders `errors/trace`
- production renders `errors/500`

The trace view receives:

- `stackTrace`
- `errorMessage`
- `severity`

`severity` is the resolved log level with its first letter uppercased.

## Stack-trace formatting

`StackTraceFormatter::compose()` starts with the throwable's origin file and then walks the throwable trace.

For each frame with a file path, it captures a short source excerpt around the reported line number. Frames originating from `Quantum\Tracer\ErrorHandler` are skipped so the trace page stays focused on the application call stack.

Source excerpts are only available when `fs()->getAdapter()` implements `LocalFilesystemAdapterInterface`.
