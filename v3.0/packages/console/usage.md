# Console Usage

## Create a custom command

For most project commands, extend `CliCommand`, declare metadata, and add your logic to `exec()`.

```php
use Quantum\Console\CliCommand;

class CleanupCommand extends CliCommand
{
    protected ?string $name = 'cleanup:temp';
    protected ?string $description = 'Remove temporary files';
    protected array $options = [
        ['force', 'f', 'none', 'Skip confirmation'],
    ];

    public function exec(): void
    {
        if (!$this->getOption('force') && !$this->confirm('Delete temporary files?')) {
            $this->comment('Operation was canceled!');
            return;
        }

        // cleanup work
        $this->info('Temporary files removed');
    }
}
```

Use this style when you want short command classes that stay close to Quantum's built-in commands.

## Read arguments and options

```php
class ModuleInspectCommand extends CliCommand
{
    protected ?string $name = 'module:inspect';
    protected array $args = [
        ['module', 'required', 'The module name'],
    ];
    protected array $options = [
        ['format', 'f', 'optional', 'Output format', 'table'],
    ];

    public function exec(): void
    {
        $module = $this->getArgument('module');
        $format = $this->getOption('format');

        $this->info("Inspecting {$module} as {$format}");
    }
}
```

Use `getArgument()` and `getOption()` inside `exec()`, after Symfony has populated runtime input.

## Ask for confirmation before overwriting state

Several built-in commands use this pattern for `.env`, keys, and destructive migration work.

```php
if (!$this->confirm('Continue?')) {
    $this->info('Operation was canceled!');
    return;
}
```

This is a good default when the command updates files or rolls data back.

## Discover commands from a directory

```php
use Quantum\Console\CommandDiscovery;

$commands = CommandDiscovery::discover(
    base_dir() . '/src/Console/Commands',
    'App\\Console\\Commands\\'
);
```

Each item contains the class name plus the command's public metadata. Use this when you want to register or inspect commands dynamically.

## Practical guidance

- Keep constructors light, especially for commands that will be auto-discovered.
- Prefer calling other package services from `exec()` instead of placing real business logic in the command itself.
- Add explicit `--yes` or `--force` options for commands that change files or state.
- If a command is used in CI or scripts, verify its actual shell exit behavior instead of relying only on console text.
