# Modules

## Overview

Modules are one of the core organizational ideas in the Quantum PHP Framework.

Instead of placing everything in one flat application structure, Quantum is designed so that related routes, controllers, views, services, and configuration can live together inside a module.

## Core idea

A module is a self-contained feature area.

Depending on the kind of module, it can contain things like:

- routes
- controllers
- views
- middlewares
- services
- models
- DTOs
- transformers
- config
- assets
- resources

So instead of thinking only in terms of one global controller folder and one global view folder, Quantum encourages grouping related application parts together.

## Why modules matter in Quantum

Modules are part of the application startup flow, not just a project-organization preference.

## Module loading process

The framework's module loader manages application startup in two phases:

1.  **Dependency Registration**: During initialization, the loader scans modules listed in `shared/config/modules.php` and loads dependencies from `modules/<ModuleName>/config/dependencies.php` **only for modules marked as enabled**.

2.  **Route Loading**: After dependencies are registered, the loader loads route definitions from `modules/<ModuleName>/routes/routes.php` **only for modules marked as enabled**.

Modules directly affect both bootstrap behavior and route availability.

## Where module configuration lives

The framework expects module configuration in:

```text
shared/config/modules.php
```

This file controls module-level options such as whether a module is enabled.

## Where module routes live

For each module, route definitions are expected at:

```text
modules/<ModuleName>/routes/routes.php
```

Each module contributes its own routes instead of relying on one global route file.

## Where module dependencies can live

A module can also provide its own dependency definitions through:

```text
modules/<ModuleName>/config/dependencies.php
```

This is where module-specific service bindings are declared.

## What a module can contain

The templates make the module shape clear.

### Default API module template
Includes areas such as:

- `Controllers/`
- `config/`
- `routes/`

### Default Web module template
Includes areas such as:

- `Controllers/`
- `Views/`
- `routes/`
- `assets/`

### Demo module templates
Demo templates also include:

- `DTOs/`
- `Enums/`
- `Middlewares/`
- `Models/`
- `Services/`
- `Transformers/`
- `resources/`

Modules can scale from small routing units to full feature packages.

## Fresh skeleton vs active modules

A fresh project skeleton may not show populated module directories immediately, but module generation and module-driven routing are built in.

In fact, Quantum includes a CLI command for generating modules:

```bash
php qt module:generate <ModuleName>
```

This command uses built-in templates such as:

- `DefaultWeb`
- `DefaultApi`
- other templates available in the framework

- an empty or lightly populated fresh project
- a modular application after modules are generated and enabled

## Modules and route prefixes

Module configuration can also contribute route prefix behavior.

The route builder reads module configuration and keeps module and prefix information attached to routes.

This helps the framework organize routes in a module-aware way rather than as unrelated URL entries.

## Modules and testing

Project tests also reinforce the module model.

There are feature tests under paths like:

```text
tests/Feature/modules/Api/
```

This confirms modules are treated as an application boundary in practice.

## When to use modules

Modules are especially useful when:

- a feature has its own routes and controllers
- a feature needs its own views or API endpoints
- you want clearer separation between application areas
- the application is growing and one shared code area is no longer enough

## Practical view

A good short way to think about Quantum modules is:

- a module groups related feature code together
- routes often start from modules
- controllers and views often live inside modules
- the framework loads modules during startup
- modules help keep larger applications organized

## What to read next

After this overview, continue with:

- [Middleware](middleware.md)
- [Request Handling](request.md)
- [Services](services.md)
- [Configuration](../advanced-features/configuration.md)
- [First App](../getting-started/first-app.md)
