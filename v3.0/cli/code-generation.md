# Code Generation

The `qt` command-line tool does more than run the local server. It also helps generate and publish project structure, migration files, environment files, application keys, and OpenAPI assets.

## What `qt` can create or publish

From the current upstream command set, `qt` can help create or publish things such as:

- new modules from templates
- new migration files
- a local `.env` file from `.env.example`
- an application key stored in `.env`
- OpenAPI UI resources and OpenAPI specification files
- DebugBar assets

So code generation in Quantum is broader than only scaffolding code files. It also includes project setup and generated project resources.

## Module generation

The main scaffolding command is:

```bash
php qt module:generate Blog
```

This command creates a new module using a template.

From the upstream `ModuleGenerateCommand`, it accepts:

- a required module name argument
- `--template` or `-t`
- `--yes` or `-y`
- `--with-assets` or `-a`

A more explicit example looks like:

```bash
php qt module:generate Blog --template=DefaultWeb --with-assets
```

## What `module:generate` actually does

From the upstream `ModuleManager`, module generation does real framework work, not just file copying.

It:

- ensures the `modules/` directory exists
- loads files from a module template
- processes template placeholders such as module namespace and module name
- writes the generated files into `modules/<ModuleName>/`
- optionally copies template assets into the assets directory
- updates `shared/config/modules.php`

So this command is important because it creates a framework-ready module and also registers it in project configuration.

## Available module templates

From the current upstream core templates, the available module templates are:

- `DefaultApi`
- `DefaultWeb`
- `DemoApi`
- `DemoWeb`
- `Toolkit`

This matters because `module:generate` is not one fixed scaffold. The template changes what kind of module structure you start with.

## What a generated module can include

Depending on the selected template, a generated module can include things such as:

- controllers
- routes
- middlewares
- views
- services
- other module files
- optional assets when `--with-assets` is used

So module generation is the real center of scaffolding in Quantum right now.

## Migration generation

Another generation command is:

```bash
php qt migration:generate create posts
```

From the upstream `MigrationGenerateCommand`, this command requires:

- an action
- a table name

The supported action flow is described in the command as:

- `create`
- `alter`
- `rename`
- `drop`

So another valid example would be:

```bash
php qt migration:generate alter posts
```

## What `migration:generate` does

This command creates a new migration file through `MigrationManager`.

Its job is focused and specific:

- generate the migration file name
- create a new migration file for the given action and table

That makes it part of Quantum's code generation story, even though it is more narrow than module scaffolding.

## Environment file generation

Quantum also includes:

```bash
php qt core:env
```

From the upstream `EnvCommand`, this command:

- checks for `.env.example`
- copies `.env.example` to `.env`
- can ask for confirmation before overwriting an existing `.env`

So this is also part of the generation story, because it creates a real project file needed for local setup.

## Application key generation

Quantum also includes:

```bash
php qt core:key
```

From the upstream `KeyGenerateCommand`, this command:

- generates a random application key
- writes it into the `APP_KEY` row in `.env`
- can ask for confirmation before replacing an existing key

This is another example where `qt` generates project state, not just source files.

## OpenAPI resource generation

Quantum also includes:

```bash
php qt install:openapi Api
```

From the upstream `OpenApiCommand`, this command can:

- publish OpenAPI UI resources into the public assets directory
- update the target module routes for OpenAPI endpoints when needed
- create the module `resources/openapi/` directory
- generate an OpenAPI `spec.json` file from controller annotations

So `qt` is also able to generate API documentation resources, not only application scaffolding.

## DebugBar asset publishing

Quantum also includes:

```bash
php qt install:debugbar
```

This publishes the DebugBar resource files into the public assets directory so the toolbar can render correctly in a project that uses it.

## What generation usually does not mean here

The current built-in command set does not show separate generators like:

- `controller:generate`
- `middleware:generate`
- `view:generate`

Those parts are usually introduced through module templates instead of individual generator commands.

## Why generation still matters

Even with a smaller command set, generation is still valuable because it helps create Quantum-aligned structure.

The main benefits are:

- faster project setup
- less manual boilerplate
- template-based module structure
- consistent migration file creation
- generated environment and key setup
- generated OpenAPI resources and specs
- automatic module config updates

## A practical way to use it

A normal flow can look like this:

1. generate `.env` with `php qt core:env`
2. generate an app key with `php qt core:key`
3. generate a module
4. inspect the generated controllers, routes, middlewares, and views
5. edit the generated files for your feature
6. generate migrations as the database changes
7. run migrations with `php qt migration:migrate`
8. publish OpenAPI resources when needed

## What to read next

These pages fit well with code generation:

- [The `qt` Command-Line Tool](qt-command-line-tool.md)
- [Console Commands](console-commands.md)
- [Modules](../core-concepts/modules.md)
- [Project Structure](../getting-started/project-structure.md)
