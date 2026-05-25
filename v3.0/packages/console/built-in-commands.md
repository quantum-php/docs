# Console Built-in Commands

The Console package ships the framework commands used for common local development and project maintenance tasks.

## Local development

### `serve`

Starts PHP's built-in web server against the `public` directory.

```bash
php qt serve --host=127.0.0.1 --port=8000
```

Behavior you can rely on:

- the command starts at the requested port and scans forward until it finds a free port
- it checks up to 50 ports total
- `--open` tries to open the resolved URL in the default browser
- invalid ports below `1` or above `65535` throw an error

Caveat: if your requested port is busy, the command may start on a later port instead of failing immediately.

### `route:list`

Builds the route collection and prints a table of registered routes.

```bash
php qt route:list
php qt route:list --module=Blog
```

Contract:

- `--module` filters routes case-insensitively by module name
- closure routes are shown as `Closure`
- controller routes are shown as `Controller@action`
- long action names are shortened in the table output

## Cron and cache maintenance

### `cron:run`

Runs due cron tasks through the Cron package.

```bash
php qt cron:run
php qt cron:run --task=nightly-report --force
```

Contract:

- `--task` runs one named task instead of the full due-task scan
- `--path` overrides the configured cron directory
- `--force` bypasses normal lock protection
- the command prints execution counts for total, executed, skipped, locked, and failed tasks

### `cache:clear`

Clears resource cache files.

```bash
php qt cache:clear --all
php qt cache:clear --type=views
php qt cache:clear --module=blog
```

Contract:

- at least one of `--all`, `--type`, or `--module` is required
- valid cache types are `views` and `asserts`
- module matching uses configured module names
- missing cache directories are reported as errors

Caveat: the built-in type name is `asserts`, not `assets`.

## Project setup

### `core:env`

Copies `.env.example` to `.env`.

```bash
php qt core:env
php qt core:env --yes
```

Contract:

- the command requires `.env.example` in the project base directory
- if `.env` already exists, the command asks before overwriting unless `--yes` is passed

### `core:key`

Generates a random application key and stores it in `.env`.

```bash
php qt core:key
php qt core:key --length=32 --yes
```

Contract:

- the `--length` option controls the byte count before hex encoding
- the stored key is therefore twice the numeric length in visible characters
- if `APP_KEY` already exists and is non-empty, the command asks before replacing it unless `--yes` is passed

### `install:debugbar`

Publishes DebugBar assets into `public/assets/DebugBar/Resources`.

### `install:openapi <module>`

Publishes Swagger UI assets if needed, injects an `openapi` route group into the module route file when missing, and writes `resources/openapi/spec.json` for the target module.

Use it only after the module exists and has OpenAPI-annotated controllers in `Controllers/OpenApi`.

### `install:toolkit <username> <password>`

Sets basic-auth environment values and then scaffolds the Toolkit module by internally running `module:generate`.

## Scaffolding and migrations

### `module:generate <module>`

Creates a new module and adds it to module config.

```bash
php qt module:generate Blog --template=DefaultWeb --with-assets
```

Contract:

- `--template` defaults to `DefaultWeb`
- `--yes` controls the generated module's enabled status
- `--with-assets` installs template assets with the module

### `migration:generate <action> <table>`

Creates a migration file through `MigrationManager`.

Valid actions are the same ones described by the command help: `create`, `alter`, `rename`, and `drop`.

### `migration:migrate [direction]`

Applies or rolls back migrations.

```bash
php qt migration:migrate
php qt migration:migrate down --step=1
```

Contract:

- default direction is `up`
- `down` asks for confirmation before rollback
- `--step` limits how many migrations to apply or revert

## Version output

### `core:version`

Prints the framework version as ASCII art plus a plain confirmation line.

This command reads the version from `config('app.version')` and falls back to `UNKNOWN` when that value is missing.
