# Module

The Module package lets Quantum discover feature modules at boot time and scaffold new modules from built-in templates.

Use it when your application is split into `modules/<ModuleName>` directories and each module owns its own routes, config, and optional assets.

## What the package handles

The package has two responsibilities:

- `ModuleLoader` reads `shared/config/modules.php`, registers module dependencies, and exposes route closures for enabled modules.
- `ModuleManager` copies a module template into `modules/<ModuleName>`, optionally copies assets, and updates the shared module registry.

## Typical module layout

The loader expects these paths:

```text
shared/config/modules.php
modules/<ModuleName>/routes/routes.php
modules/<ModuleName>/config/dependencies.php
```

Only `routes/routes.php` is required for enabled modules. `config/dependencies.php` is optional.

## How module enabling works

`shared/config/modules.php` must return an array keyed by module name. Each item can include:

- `enabled` — whether the module's routes should be loaded
- `prefix` — stored in config for the rest of the framework to use

Example:

```php
return [
    'Blog' => [
        'prefix' => 'blog',
        'enabled' => true,
    ],
    'Admin' => [
        'prefix' => 'admin',
        'enabled' => false,
    ],
];
```

Enabled controls route loading only.

## Important behavior to rely on

- Module dependencies are registered for every configured module, even when `enabled` is `false`.
- Module routes are loaded only for modules whose config has a truthy `enabled` value.
- Each route file must return a `Closure`.
- Missing route files for enabled modules fail fast with a `ModuleException`.

## Built-in templates

`ModuleManager` scaffolds from `src/Module/Templates/<TemplateName>`.

Templates shipped in the package include:

- `DefaultApi`
- `DefaultWeb`
- `DemoApi`
- `DemoWeb`
- `Toolkit`

These templates vary in size. Some only create controllers, config, and routes. Others also include models, services, views, translations, or static assets.

## When to use this package directly

Most applications will interact with modules through Quantum bootstrapping or CLI commands. You would use the package classes directly when you are:

- building custom project scaffolding
- writing installation flows
- inspecting module route definitions programmatically
- generating modules from your own automation

## Related pages

- [Architecture](architecture.md)
- [Usage](usage.md)
- [Contracts](contracts.md)
