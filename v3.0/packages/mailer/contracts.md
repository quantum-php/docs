# Mailer Contracts

The Mailer package keeps a small shared contract and several adapter-specific runtime rules.

## The common adapter surface

Every adapter resolved by the factory must implement `Quantum\Mailer\Contracts\MailerInterface`.

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

## Adapter-specific methods are not portable

`Quantum\Mailer\Mailer` forwards unknown methods directly to the adapter instance.

That means methods such as `setCC()` or `setAttachment()` are not part of the package-wide contract. They work only when the current adapter implements them.

If the method does not exist on the active adapter, the wrapper throws a mailer exception.

## `send()` is a one-shot operation

The shared trait resets the composed message fields immediately after each send attempt.

So this contract matters:

- compose
- send once
- rebuild the message if you need to send again

Do not expect the adapter to keep your previous sender, recipients, subject, or body after `send()` returns.

## Template contract

`setTemplate()` stores a base path, not a full filename.

At send time the package always requires:

```text
<templatePath>.php
```

If the body is an array, the package extracts it into local variables before requiring the template.

## Failure contract

`send()` reports failure as `false`.

It does not return a response object or provider payload. Built-in failure details come from the adapter's transport error list, which the package logs through `warning(...)`.

## Mail trap contract

When `mailer.mail_trap` is enabled, `send()` means "save locally" rather than "deliver remotely".

Success then depends on whether the package can write a `.eml` file to `shared/emails`.

## Message ID contract

In long-running processes, the package can reuse the same generated message ID across multiple sends from the same adapter class.

If your workflow depends on a new ID per message, do not rely on the package to provide that automatically.