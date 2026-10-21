# The `qt` Command-Line Tool

The `qt` file is the command-line entry point for a Quantum PHP Framework project.

When you run a command like:

```bash
php qt serve
```

`qt` is the file that boots the console application and hands control to Quantum's command system.

## What `qt` is

In the starter project, `qt` is a PHP script in the project root.

Its job is very small and very important:

1. load Composer autoloading
2. create the application in console mode
3. start the console application
4. return the exit status

The key line is:

```php
$status = AppFactory::create(AppType::CONSOLE, __DIR__)->start();
```

That tells Quantum to boot as a console app instead of as a web app.

**Important Note on App Instances**: `AppFactory::create()` caches the application instance per `type` in memory (e.g., `AppType::CONSOLE`). Repeated calls to `create()` with the same type will return the first initialized instance, even if a different `baseDir` is provided. If you need to re-initialize an application with a different directory in the same process, you must call `AppFactory::destroy($type)` explicitly before recreating it.

## What happens when `qt` runs

From the upstream console boot flow, this is the basic sequence.

### 1. `qt` starts the console app
The starter project calls `AppFactory::create(AppType::CONSOLE, __DIR__)`.

That gives Quantum a base directory and tells it to use the console application path.

### 2. Quantum builds the console adapter
In core, console mode uses `ConsoleAppAdapter`.

Before anything else, it sets up:

- `ArgvInput` for reading CLI arguments
- `ConsoleOutput` for writing output
- a Symfony Console `Application`

So `qt` is not a shell wrapper around random scripts. It boots a real console application.

### 3. Helpers load and core commands are registered
Next, Quantum loads the helper functions and registers the framework's built-in commands from:

```text
Quantum\Console\Commands
```

These include commands such as:

- `serve`
- `route:list`
- `module:generate`
- `migration:generate`
- `migration:migrate`
- `core:env`
- `core:key`

### 4. Quantum loads the project
Then Quantum loads what commands usually rely on: `.env`, the app config, and the error handler. It also names the console application from `app.name` and `app.version`.

### 5. App commands are registered
Last, Quantum registers project-level commands from:

```text
shared/Commands/
```

in the starter project. They come after the environment and the config, so a command's constructor can use `env()` and `config()`.

That means `qt` can run both:

- framework commands provided by core
- custom commands defined by your project

### 6. The command is validated and executed
The console app reads the first CLI argument as the command name.

If the command does not exist, Quantum throws ``Command `<name>` is not defined``.
Otherwise, Symfony Console runs it.

## What `qt` does for developers

In day-to-day work, `qt` is the main entry point for project commands.

It is how you:

- start the local server
- inspect routes
- generate modules
- generate migrations
- run migrations
- generate `.env`
- generate `APP_KEY`
- run custom project commands

So the easiest way to think about it is:

- `qt` is the project CLI entry point
- it boots Quantum in console mode
- it exposes both core and app-specific commands

## Why `qt` matters

Without `qt`, you would not have one consistent project command surface.

Instead of running unrelated scripts, Quantum gives the project a single command-line entry point with shared bootstrapping, shared configuration loading, shared output handling, and a consistent command structure.

That makes the developer workflow cleaner and easier to extend.

## `qt` and custom commands

One of the most useful parts of the design is that `qt` is not limited to built-in framework commands.

Because the console app also scans `shared/Commands/`, you can add your own commands and run them through the same `php qt ...` interface.

That means the same tool can be used for:

- framework operations
- project setup tasks
- data generation
- maintenance scripts
- app-specific automation

## A practical example

When you run:

```bash
php qt route:list
```

this is roughly what happens:

1. `qt` loads the Composer autoloader
2. Quantum boots the console application
3. core commands and shared project commands are registered
4. the `route:list` command is resolved
5. the command loads routes and renders them in a console table

The same pattern applies to other commands.

## Commands without a working environment

Picture a fresh clone of a project: there is no `.env` yet, and the first thing you run is:

```bash
php qt core:env
```

That command creates `.env` from `.env.example`, so it has to work exactly when loading `.env` cannot. When `.env` is missing or cannot be parsed, Quantum therefore looks at the requested command before it loads the rest of the project:

- `core:env`, and Symfony's `list` and `help`, run. The boot stops before the environment, so nothing that needs it is loaded: no app config, no error handler, and none of your own commands.
- Every other command stops right away with the error of the environment file, for example ``The file `.env` not found.`` or ``Failed to parse dotenv file``, instead of failing later with a confusing one.

Once `.env` works again, for example after `php qt core:env --yes` has recreated it from `.env.example`, every command runs as usual.

Your own commands are registered last ([step 5](#5-app-commands-are-registered)), after the point where the boot stops, so `php qt list` shows only the framework's commands and running one of yours reports the environment error. Which framework commands can run without the environment is set with `CliCommand::$requiresEnvironment`, which `core:env` sets to `false`.

Without a working `.env` the application name is not read from your config, so `php qt list` shows it as `UNKNOWN`.

## In one sentence

`qt` is the command-line front door of a Quantum PHP Framework project.

## What to read next

This page fits well with:

- [CLI Overview](overview.md)
- [Development Server](development-server.md)
- [Console Commands](console-commands.md)
