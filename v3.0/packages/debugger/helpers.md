# Debugger Helpers

The package exposes one helper.

## `debugbar()`

```php
function debugbar(): Debugger
```

`debugbar()` is the public entry point for the package.

Behavior:

1. checks whether `Quantum\Debugger\Debugger` is registered in `Quantum\Di\Di`
2. registers it if missing
3. returns the container-managed instance

## Lifecycle implications

- repeated `debugbar()` calls return the same DI-managed `Debugger` instance for the current process
- that instance keeps the same `DebuggerStore` and `DebugBar` objects unless the container is rebuilt
- helper consumers do not need to pass dependencies manually in normal application code

## Where the helper is used in core

Current framework usage includes:

- `InitDebuggerStage` for store initialization
- `MessageAdapter` for logging into debug tabs
- default web layout templates for final rendering
- `ViewFactory` for injecting the debugger into `Quantum\View\View`

For application code, this helper is the supported API. The framework does not expose a separate factory class for the package.
