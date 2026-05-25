# Mailer Contracts

The Mailer package keeps a small shared contract and a few adapter-specific runtime rules.

## The common adapter surface

Every adapter resolved by the factory implements `Quantum\Mailer\Contracts\MailerInterface`.

That gives you this common API:

- `setFrom(string $email, ?string $name = null)`
- `getFrom(): array`
- `setAddress(string $email, ?string $name = null)`
- `getAddresses(): array`
- `setSubject(?string $subject)`
- `getSubject(): ?string`
- `setTemplate(string $templatePath)`
- `getTemplate(): ?string`
- `setBody(array|string|null $message)`
- `getBody()`
- `send(): bool`

If you want code that works across all mailer adapters, stay within that surface.

## Adapter-specific methods

`Quantum\Mailer\Mailer` forwards unknown methods directly to the adapter instance.

That means methods such as `setCC()` or `setAttachment()` are adapter features rather than package-wide features. Use them when you know which transport is active.

If the active adapter does not provide the method, the wrapper throws a mailer exception.

## `send()` is a per-message workflow

The shared trait resets the composed fluent fields after each send attempt.

In practice, the reliable workflow is:

- compose the sender, recipients, subject, and body or template
- call `send()` once
- compose the next message again

`MailerFactory` also reuses one wrapper per adapter name, so a fully composed message on every send keeps shared adapter instances consistent across loops, jobs, and long-running workers.

## Template contract

`setTemplate()` stores a base path, not a full filename.

At send time the package requires:

```text
<templatePath>.php
```

If the body is an array, the package extracts it into local variables before requiring the template.

## Delivery result contract

`send()` reports delivery state as `true` or `false`.

It does not return a provider response object. Built-in transport details are mirrored into the debugger mails tab from the adapter error list.

## Mail trap contract

When `mailer.mail_trap` is enabled, `send()` means "save locally" rather than "deliver remotely".

That flow writes a `.eml` file into `shared/emails`, and `MailTrap` can parse that file later for subject, addresses, body, and attachments.

## Message ID contract

In long-running processes, the package can reuse the same generated message ID across multiple sends from the same adapter class.

If your workflow depends on a fresh ID per message, provide your own naming or tracking value alongside the mailer flow.
