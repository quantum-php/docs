# Console Contracts

This page covers the behavior you can rely on when building on the Console package.

## Custom command contract

A custom command should extend `Quantum\Console\CliCommand` and implement `exec()`:

```php
use Quantum\Console\CliCommand;

class SendReportsCommand extends CliCommand
{
    protected ?string $name = 'reports:send';
    protected ?string $description = 'Send pending reports';

    public function exec(): void
    {
        $this->info('Sending reports...');
    }
}
```

Contract:

- `exec()` is the command body
- command metadata is declared through properties, not constructor arguments
- input and output helpers are available only during `exec()`

## Argument and option declaration contract

Arguments use this shape:

```php
protected array $args = [
    ['module', 'required', 'The module name'],
];
```

Options use this shape:

```php
protected array $options = [
    ['force', 'f', 'none', 'Force execution'],
    ['path', 'p', 'optional', 'Custom path'],
];
```

Rules:

- argument entries are interpreted as `[name, mode, description]`
- option entries are interpreted as `[name, shortcut, mode, description, default?]`
- unsupported modes are silently ignored by the base class
- `getArgument()` and `getOption()` return an empty string when the key is missing

## Prompt contract

Use `confirm($message)` when the command should ask before destructive or overwrite-heavy work.

Contract:

- the prompt format is `message [y/N]`
- the default answer is `No`
- commands that add a `--yes` option usually skip the prompt themselves; the base class does not do that automatically

## Output contract

The helper methods write formatted lines directly to Symfony output:

- `output()` plain line
- `info()` green/info-style line
- `comment()` comment-style line
- `question()` question-style line
- `error()` error-style line

The package does not buffer or structure output for later inspection.

## Exit-status caveat

`CliCommand::execute()` always returns Symfony's success code after `exec()` finishes.

That means:

- printing an error does not automatically fail the process
- returning early from `exec()` still exits successfully
- commands that need a hard failure must throw or terminate explicitly

This matters for automation: do not assume every printed failure message produces a non-zero shell exit code.

## Discovery contract

`CommandDiscovery::discover()` returns only metadata for command classes it can instantiate immediately.

Practical consequences:

- avoid required constructor parameters in commands meant for discovery
- avoid expensive constructor work when possible
- discovery is best for registration, listing, or help screens, not for lazy dependency setup
