# Module Architecture

The Module package is split between runtime loading and filesystem scaffolding.

Use `ModuleLoader` during boot or route registration, and use `ModuleManager` when you want to generate a new module from one of the built-in templates.

## Runtime loader

`ModuleLoader` keeps three in-memory caches:

- loaded module config entries
- loaded dependency arrays per module
- loaded route closures per module

On construction it immediately loads module dependency definitions and passes them to `Di::registerDependencies(...)`.

That has two practical consequences:

1. module dependency registration happens before route loading
2. only enabled modules contribute DI bindings

## Configuration source

The loader reads one shared file:

```text
shared/config/modules.php
```

If that file is absent, package operations that need module config raise `ModuleException::moduleConfigNotFound()`.

The config array drives both enabled-dependency discovery and enabled-route filtering.

## Dependency loading flow

For each enabled module in config, `ModuleLoader` looks for:

```text
modules/<ModuleName>/config/dependencies.php
```

If the file exists and returns an array, that array is merged into the cumulative dependency map. If the file is missing or does not return an array, the module contributes no bindings.

When multiple modules declare the same dependency key, modules listed later in `shared/config/modules.php` win and override earlier bindings.

## Route loading flow

`loadModulesRoutes()` filters the config list to modules with a truthy `enabled` option, then reads:

```text
modules/<ModuleName>/routes/routes.php
```

The file must exist and return a `Closure`. The closure is cached per module after the first read.

A loader instance also keeps its module config and dependency maps in memory. After you edit `shared/config/modules.php`, `config/dependencies.php`, or `routes/routes.php` in the same process, create a fresh `ModuleLoader` so the next read uses the updated files.

## Scaffolding flow

`ModuleManager` creates a module in two steps:

1. `writeContents()` copies template files into `modules/<ModuleName>` and optionally into `assets/<ModuleName>`.
2. `addModuleConfig()` appends the module entry to `shared/config/modules.php`.

The package does not combine those steps automatically. If you use `ModuleManager` directly, you are responsible for calling both methods.

## Template processing

Files under a template's `src/` tree are copied into the new module with placeholder replacement applied during the write step:

- `*.php.tpl` becomes `*.php`
- other filenames keep their original name
- `{{MODULE_NAMESPACE}}` resolves to `<module base namespace>\\<ModuleName>`
- `{{MODULE_NAME}}` resolves to the requested module name

Files under a template's `assets/` tree are copied as-is.

## Prefix defaults

`ModuleManager` generates module config like this:

- `DemoWeb` template => empty `prefix`
- every other template => lowercase module name as `prefix`

That prefix is written into `shared/config/modules.php` and later consumed elsewhere in the framework.
