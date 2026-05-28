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

That adapter creates:

- `ArgvInput` for reading CLI arguments
- `ConsoleOutput` for writing output
- a Symfony Console `Application`

So `qt` is not a shell wrapper around random scripts. It boots a real console application.

### 3. Quantum runs boot stages
Before commands are executed, the console adapter runs a boot pipeline.

Depending on the command, that includes stages such as:

- loading helper functions
- loading environment values
- loading app config
- setting up the error handler

**Note**: Some boot stages, specifically those related to environment loading, are special-cased by `ConsoleAppAdapter` to ensure stable discovery and execution.

### 4. Core commands are registered
Quantum then registers the framework's built-in commands from:

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

### 5. App commands are registered
After that, Quantum registers project-level commands from:

```text
shared/Commands/
```

in the starter project.

That means `qt` can run both:

- framework commands provided by core
- custom commands defined by your project

### 6. The command is validated and executed
The console app reads the first CLI argument as the command name.

If the command does not exist, Quantum throws an error.
If it exists, Symfony Console runs it.

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

## In one sentence

`qt` is the command-line front door of a Quantum PHP Framework project.

## What to read next

This page fits well with:

- [CLI Overview](overview.md)
- [Development Server](development-server.md)
- [Console Commands](console-commands.md)
