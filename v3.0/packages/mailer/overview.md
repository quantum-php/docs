# Mailer

The Mailer package gives Quantum a shared mail-sending entry point with one SMTP transport and several API transports.

Use it when you want to build an email with `mailer()`, choose a configured delivery adapter, and send either a raw HTML body or a PHP template.

## When to use it

Reach for Mailer when you need to:

- send application emails through the configured default provider
- switch between SMTP and provider APIs without changing the calling code
- render email bodies from a PHP template file
- save outgoing messages to the local mail trap instead of sending them

If you only need to inspect saved `.eml` files, use `MailTrap` directly. The Mailer package is the sending layer.

## Package shape

The package is built from a few small parts:

- `Quantum\Mailer\Mailer` is the proxy object returned by `mailer()`
- `Quantum\Mailer\Factories\MailerFactory` resolves and caches one mailer per adapter name
- adapters implement `Quantum\Mailer\Contracts\MailerInterface`
- `Quantum\Mailer\Traits\MailerTrait` provides the shared message-building and reset behavior
- `Quantum\Mailer\MailTrap` saves and parses local `.eml` files when mail trapping is enabled

## Supported adapters

Mailer supports these adapter names:

- `smtp`
- `mailgun`
- `mandrill`
- `sendgrid`
- `sendinblue`
- `resend`

The factory resolves the requested adapter or `mailer.default` when you do not pass one.

## Common message flow

All adapters share the same base flow:

1. set the sender with `setFrom()`
2. add one or more recipients with `setAddress()`
3. optionally set a subject
4. provide either `setBody()` or `setTemplate()` with message data
5. call `send()`

After `send()` finishes, the package clears the sender, recipients, subject, body, and template from the adapter instance.

## Important constraints

- `MailerFactory` caches one `Mailer` instance per adapter name inside the shared factory service.
- Adapter-specific methods are available only when the underlying adapter implements them.
- Only the SMTP adapter supports reply-to, CC, BCC, and attachments.
- Template paths are stored without the `.php` suffix. The package always requires `<template>.php`.
- `send()` returns `false` on transport failure and logs transport errors to the debugger mails tab through `warning(...)`.
- Message IDs are cached in static adapter state, so long-running processes should not assume every send gets a fresh generated message ID.
- When `mailer.mail_trap` is enabled, the package saves a local `.eml` file instead of contacting the transport.