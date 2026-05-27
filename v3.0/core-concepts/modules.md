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

From the upstream source, modules are not just a convenience pattern. They are built into the application startup flow.

## The Module Loading Process

The framework's module loader manages application startup in two distinct phases:

1.  **Dependency Registration**: During initialization, the loader scans all modules listed in `shared/config/modules.php`. It automatically loads all module dependencies defined in `modules/<ModuleName>/config/dependencies.php`, **regardless of whether the module is enabled**.
    *   *Caution*: Because dependencies are loaded before the enabled check, if a disabled module contains service definitions in its `dependencies.php`, these services will still be registered in the DI container and may impact application behavior.

2.  **Route Loading**: After dependencies are registered, the loader selectively loads route definitions from `modules/<ModuleName>/routes/routes.php`, but **only for modules explicitly marked as enabled** in the module configuration.

That means modules participate directly in how the application boots and how routes become available.

## Where module configuration lives

The framework expects module configuration in:

```text
shared/config/modules.php
```

This file controls module-level options such as whether a module is enabled.

So a project may support modules structurally even if only some of them are active at a given time.

## Where module routes live

For each module, route definitions are expected at:

```text
modules/<ModuleName>/routes/routes.php
```

This is important because it shows how modules connect to routing.

Each module contributes its own routing rules instead of relying on one central route file for the whole application.

## Where module dependencies can live

A module can also provide its own dependency definitions through:

```text
modules/<ModuleName>/config/dependencies.php
```

That helps modules declare the services or bindings they need.

## What a module can contain

The upstream templates make the module shape much clearer.

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
The richer demo templates show that modules can also contain:

- `DTOs/`
- `Enums/`
- `Middlewares/`
- `Models/`
- `Services/`
- `Transformers/`
- `resources/`

So modules in Quantum can scale from simple to fairly complete feature packages.

## Fresh skeleton vs active modules

A fresh project skeleton may not always show populated module directories immediately. But that does **not** mean modules are theoretical or undocumented features.

The upstream project and framework clearly support module generation and module-driven routing.

In fact, Quantum includes a CLI command for generating modules:

```bash
php qt module:generate <ModuleName>
```

This command uses built-in templates such as:

- `DefaultWeb`
- `DefaultApi`
- other richer templates depending on use case

So it helps to understand the difference between:

- an empty or lightly populated fresh project
- a real modular application after modules are generated and enabled

## Modules and route prefixes

Module configuration can also contribute route prefix behavior.

The route builder reads module configuration and keeps module and prefix information attached to routes.

This helps the framework organize routes in a module-aware way rather than as unrelated URL entries.

## Modules and testing

The upstream project tests also reinforce the module model.

There are feature tests under paths like:

```text
tests/Feature/modules/Api/
```

That is a practical signal that modules are a real application boundary in Quantum, not just a documentation concept.

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

After this overview, the next good documentation step would be deeper pages on:

- [Middleware](middleware.md)
- [Request Handling](request.md)
- [Services](services.md)
- [Configuration](../advanced-features/configuration.md)
- [First App](../getting-started/first-app.md)
