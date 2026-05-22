# Session Contracts

This page defines behavior you can rely on when integrating with Session.

## Wrapper contract

`session()` returns `Quantum\Session\Session`, which forwards supported calls to the active adapter.

Unsupported method calls throw a session exception.

## Read/write contract

- `set(string $key, mixed $value): void`
- `get(string $key): mixed|null`
- `delete(string $key): void`
- `all(): array`

Use Session APIs as the source of truth for values.

## Presence contract

- `has(string $key): bool`

A key is considered present only when it exists and is not empty.

These values are treated as missing:

- `null`
- `false`
- `0`
- `'0'`
- `''`

Because `get()` depends on `has()`, these values read back as `null`.

## Flash contract

- `setFlash(string $key, mixed $value)`
- `getFlash(string $key): mixed|null`

`getFlash()` returns the value once and deletes it in the same call.

## Lifecycle contract

- `flush(): void` clears storage and destroys session state
- `getId(): ?string` returns current session ID when available
- `regenerateId(): bool` regenerates ID only when a session is active

Use `regenerateId()` after authentication or privilege changes.

## Adapter resolution contract

Supported adapter names:

- `native`
- `database`

Unknown adapter names fail during resolution.

When no adapter is passed, resolution uses `session.default` config.
