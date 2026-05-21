# Loader Architecture

The Loader package has a simple two-step flow:

```text
Setup
  -> Loader::setup($setup)
  -> Loader::fileExists() | Loader::getFilePath() | Loader::load()
```

## `Setup` state

`Setup` is a mutable value object. It stores:

- `$pathPrefix`
- `$fileName`
- `$hierarchical`
- `$module`
- `$exceptionMessage`

Constructor defaults matter:

- `hierarchical` starts as `true`
- `module` is populated from `request()->getCurrentModule()` when no module is passed
- `exceptionMessage` becomes `File `<pathPrefix>/<fileName>` not found!`

Because the module default comes from the current request, the same `new Setup('config', 'app')` call can resolve differently inside and outside a module request.

## File path resolution flow

Loader resolves one primary path first, then optional shared fallback.

Primary path:

- with module: `modules/<module>/<pathPrefix>/<fileName>.php`
- without module: `<pathPrefix>/<fileName>.php`

Shared fallback (only when `hierarchical === true`):

```text
<base-dir>/shared/<lowercased pathPrefix>/<fileName>.php
```

So `shared/` is fallback-only; it is not the primary lookup location.

## Fallback behavior

`fileExists()` and `getFilePath()` follow the same search order:

1. try the primary path from `resolveFilePath()`
2. if missing and `hierarchical === true`, try `shared/<pathPrefix>/<fileName>.php`
3. if still missing, report failure

The difference is in the result:

- `fileExists()` returns `false`
- `getFilePath()` throws `LoaderException`

## Loading behavior

`load()` executes the resolved PHP file and returns its result.

Practical effects:

- the target file executes immediately
- returned value comes from that file
- missing files raise `LoaderException`

## Directory loading behavior

`loadDir($dir)` is separate from the `Setup` model.

It expands this pattern:

```text
<dir>/*.php
```

and then includes each match with `require_once`.

Quantum uses this during bootstrap to load package, app, and module helper files. Because the method relies on `glob()`, wildcard directory patterns such as `modules/*/helpers` work.

## Lifecycle caveat with DI

Several core packages resolve `Loader` through `Di::get(Loader::class)`, which returns a shared instance for the current container.

`Loader::setup()` mutates that instance in place. In practice, every caller is expected to call `setup()` immediately before `fileExists()`, `getFilePath()`, or `load()`.

Do not assume the DI-managed loader keeps a safe permanent configuration between calls.
