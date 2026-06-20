# Console Commands

The Quantum PHP Framework ships with a real console application, not just a few helper scripts.

In the starter project, the `qt` file boots the console app like this:

```php
$status = AppFactory::create(AppType::CONSOLE, __DIR__)->start();
```

That means when you run commands such as `php qt serve`, you are using the framework's console layer directly.

## Where console commands come from

The console command system is split across the core framework and the starter project.

### In `framework`
The core framework provides:

- the base command class: `Quantum\Console\CliCommand`
- command discovery: `Quantum\Console\CommandDiscovery`
- built-in commands such as:
  - `serve`
  - `route:list`
  - `module:generate`
  - `migration:generate`
  - `migration:migrate`
  - `core:env`
  - `core:key`
  - `install:toolkit`
  - `resource:clear`
  - `install:openapi`
  - `cron:run` (See [Cron Scheduling](#cron-scheduling))
  - `debugbar`
  - `version`

### In `project`
The starter project adds its own project-level commands under:

```text
shared/Commands/
```

Examples from the starter project include:

- `DemoCommand`
- `UserCreateCommand`
- `UserDeleteCommand`
- `UserShowCommand`
- `PostCreateCommand`
- `PostUpdateCommand`
- `PostDeleteCommand`
- `PostShowCommand`
- `CommentCreateCommand`
- `CommentDeleteCommand`

So the command system is designed to be extendable. The framework gives you the console infrastructure, and the project can add its own app-specific commands.

## How command discovery works

From the upstream `CommandDiscovery`, Quantum scans a directory of PHP classes, checks whether each class exists, and keeps only classes that are instantiable subclasses of `CliCommand`.

In practice, that means a command is discovered when it:

- exists in the expected commands directory
- is autoloadable
- extends `Quantum\Console\CliCommand`
- can be instantiated

**Note**: The `ConsoleAppAdapter` special-cases `core:env` boot stages to ensure the environment is ready for command discovery and execution.

This makes the console layer convention-based, similar to other Quantum subsystems.

## The base command class

All framework-style commands extend `Quantum\Console\CliCommand`.

That base class gives commands:

- a command name
- a description
- optional help text
- argument definitions
- option definitions
- helper methods such as:
  - `getArgument()`
  - `getOption()`
  - `info()`
  - `comment()`
  - `question()`
  - `error()`
  - `confirm()`

The actual command logic lives in:

```php
public function exec(): void
```

That is the method your command implements.

## What a command class looks like

A typical command class in Quantum defines a few protected properties and then implements `exec()`.

A simplified example, based on the real command structure, looks like this:

```php
class ExampleCommand extends CliCommand
{
    protected ?string $name = 'example:run';

    protected ?string $description = 'Runs the example command';

    protected array $args = [
        ['name', 'required', 'The name value'],
    ];

    protected array $options = [
        ['yes', 'y', 'none', 'Accept confirmation'],
    ];

    public function exec(): void
    {
        $name = $this->getArgument('name');

        if (!$this->getOption('yes') && !$this->confirm('Continue?')) {
            $this->info('Operation was canceled!');
            return;
        }

        $this->info('Hello ' . $name);
    }
}
```

The exact business logic depends on the command, but the class shape stays consistent.

## Built-in command categories

From the current upstream commands, the built-in console commands roughly group into these categories.

### Development server

- `serve`

This starts the PHP development server from the project, scans for an available port, and can optionally open a browser.

## Routing and inspection

- `route:list`

This loads module routes, builds a route collection, and renders a console table with module, method, URI, action, and middleware.

## Modules

- `module:generate`

This creates a new module using a selected template such as `DefaultWeb`, `DefaultApi`, `DemoWeb`, or `DemoApi`.

It also updates module configuration after generating the files.

## Migrations

- `migration:generate`
- `migration:migrate`

These commands create migration files and apply migrations.

The migrate command also supports:

- optional direction argument such as `down`
- `--step` option
- confirmation before destructive rollback behavior

## Environment and keys

- `core:env`
- `core:key`

These commands help prepare the local project environment.

`core:env` copies `.env.example` to `.env`.

`core:key` generates an `APP_KEY` and writes it into `.env`.

## Project/demo commands

The starter project also demonstrates how application-specific commands can be more advanced.

For example, `DemoCommand` in `shared/Commands/`:

- extends `CliCommand`
- uses `install:demo` as its command name
- defines the `--yes` option
- uses confirmation prompts
- runs multi-step project setup logic
- coordinates other commands such as:
  - `module:generate`
  - `migration:migrate`
  - user/post/comment commands

This is important because it shows that Quantum commands are not limited to tiny one-step actions. They can orchestrate real project workflows.

## Arguments and options

In `CliCommand`, command arguments and options are declared as arrays.

### Arguments
Argument definitions use values such as:

- `required`
- `optional`
- `array`

Example shape:

```php
protected array $args = [
    ['module', 'required', 'The module name'],
];
```

### Options
Option definitions use values such as:

- `none`
- `required`
- `optional`
- `array`

Example shape:

```php
protected array $options = [
    ['template', 't', 'optional', 'The module template', 'DefaultWeb'],
    ['yes', 'y', 'none', 'Accept confirmation'],
];
```

This array-based approach is part of how Quantum keeps command definitions compact.

## Confirmation prompts and console output

One nice detail in the upstream command layer is that commands have small convenience methods for console interaction.

That includes:

- `info()` for success/info output
- `comment()` for neutral notes
- `question()` for question-style output
- `error()` for errors
- `confirm()` for yes/no confirmation

This makes command code easier to read than manually working with raw Symfony Console output everywhere.

## How to think about the console layer

A useful way to look at it is:

- the `qt` file is the project entry point
- `framework` provides the command framework and built-in commands
- `project` shows how projects add their own commands
- `CliCommand` is the base shape for framework-style console commands

Once that clicks, the console side of Quantum becomes much easier to extend.

## Cron Scheduling

The framework provides an integrated scheduler for automating recurring tasks.

### Task Authoring

Tasks are discovered by scanning PHP files within the configured `cron.path` directory (defaulting to `base_dir()/cron`). Each file must return an object implementing `CronTaskInterface` or an array with the following structure:

- **Structure**: `['name' => '...', 'expression' => '* * * * *', 'callback' => ...]`
- **Expression**: Uses standard crontab-like syntax.
- **Callback**: A callable function or service method to execute.

### Execution Semantics

When `cron:run` is invoked, the `CronManager`:

1.  **Task Discovery**: Scans the configured cron directory for task files.
2.  **Locking Mechanism**: Utilizes `CronLock` to manage task exclusivity.
    *   **Acquire/Release**: Prevents concurrent execution of the same task.
3.  **Run Statistics**: Returns an array of execution statistics including `total`, `executed`, `skipped`, `failed`, and `locked` task counts.
4.  **Bypass**: Use `--force` with `cron:run` to bypass lock acquisition and release.

*Note: The scheduler requires a system-level crontab entry to trigger `php qt cron:run` periodically.*

## What to read next

This page fits well with:

- [CLI Overview](overview.md)
- [Development Server](development-server.md)
- [Code Generation](code-generation.md)
- [Modules](../core-concepts/modules.md)
