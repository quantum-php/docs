# Console Architecture

The Console package follows a simple flow:

1. define a command class by extending `CliCommand`
2. let the console application construct the command
3. let Symfony inject parsed input and output objects at runtime
4. run the command's `exec()` method

## Command lifecycle

`CliCommand` uses protected properties to describe the command:

- `$name`
- `$description`
- `$help`
- `$args`
- `$options`

When the command is constructed, the base class passes the name to Symfony and applies description and help text if they exist.

Later, Symfony calls `configure()`, and the base class translates `$args` and `$options` into real Symfony arguments and options.

When the user runs the command, `execute()` stores the current input and output objects and then calls `exec()`.

## Input model

Arguments and options are declared as arrays, not by overriding Symfony methods directly.

Supported argument modes are:

- `required`
- `optional`
- `array`

Supported option modes are:

- `none`
- `required`
- `optional`
- `array`

That keeps custom commands short, but it also means the declaration format must match what `CliCommand` expects.

## Discovery model

`CommandDiscovery::discover($directory, $namespace)` scans the given directory, resolves class names, and returns metadata for each valid command.

A class is included only when all of these are true:

- the class exists
- the class is instantiable
- the class extends `CliCommand`

For each matching class, discovery returns:

- `class`
- `name`
- `description`
- `help`

Because discovery instantiates the command just to read that metadata, constructors should stay lightweight and safe to run during command listing or bootstrap.

## Built-in command pattern

The built-in commands are thin wrappers around other packages. For example:

- `cron:run` delegates to the Cron package
- `migration:*` delegates to the Migration package
- `route:list` builds routes through Module and Router
- `cache:clear` clears resource cache through Loader, Config, and Storage

That makes Console an orchestration layer rather than a separate application runtime.
