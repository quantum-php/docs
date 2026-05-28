# Console

The Console package provides Quantum's command base class, command discovery helper, and the built-in framework commands used by `qt`.

Use it when you want to:

- add project-specific CLI commands
- inspect routes and scheduled work from the terminal
- run framework setup tasks such as key generation, module scaffolding, and local serving

## Package shape

The package has three main pieces:

- `Quantum\Console\CliCommand` is the base class for custom commands
- `Quantum\Console\CommandDiscovery` finds command classes inside a directory
- `Quantum\Console\Commands\*` contains the framework's built-in commands

## What the package gives you

A Console command can declare:

- a command name
- a description and help text
- positional arguments
- named options
- one `exec()` method with your command logic

The base class also gives you small terminal helpers such as `info()`, `error()`, `comment()`, `question()`, and `confirm()`.

## Important constraints

- Discovered commands must be instantiable subclasses of `CliCommand`.
- Discovered commands must have a constructor that can be called without required arguments, because `CommandDiscovery` creates them with `newInstance()` and no parameters.
- `CliCommand::execute()` always returns Symfony's success status after calling `exec()`. In practice, many command failures are printed as messages instead of returning a non-zero exit code.
- Input and output objects are available only while the command is running. Calling `getArgument()`, `getOption()`, or output helpers before execution raises a runtime error.

