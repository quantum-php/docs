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
- `getTransportLog(): array`

If you want code that works across all mailer adapters, stay within that surface. The built-in adapters implement it through `Quantum\Mailer\Traits\MailerTrait`; a custom adapter that implements the interface without the trait has to provide every method, `getTransportLog()` included.

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

`send()` reports delivery state as `true` or `false`; it does not return a provider response object.

The API adapters catch transport failures and return `false`. The SMTP adapter runs PHPMailer with exceptions enabled, so a failed SMTP send throws `PHPMailer\PHPMailer\Exception` instead.

## Transport log

`getTransportLog()` returns what the adapter recorded while sending, oldest first:

- the transport errors of every send that returned `false`; they are also logged with `warning()`
- in debug mode, the SMTP adapter's exchange with the server, one entry per PHPMailer debug line. PHPMailer writes `[credentials hidden]` in place of the login lines.

```php
use Quantum\Mailer\Enums\MailerType;

$mailer = mailer(MailerType::MAILGUN);

if (!$mailer->setFrom('noreply@example.com')->setAddress('jane@example.com')->setSubject('Hi')->setBody('Hello')->send()) {
    $errors = $mailer->getTransportLog();
}
```

The log belongs to the adapter instance and nothing clears it. `MailerFactory` reuses one adapter per name, so in a long-running process it spans every send through that adapter. In debug mode the debug toolbar shows the default mailer's log in its `mails` tab ([Debugger Architecture](../debugger/architecture.md#where-each-tabs-data-comes-from)).

## Mail trap contract

When `mailer.mail_trap` is enabled, `send()` means "save locally" rather than "deliver remotely".

That flow writes a `.eml` file into `shared/emails`, and `MailTrap` can parse that file later for subject, addresses, body, and attachments.

## Message ID contract

In long-running processes, the package can reuse the same generated message ID across multiple sends from the same adapter class.

If your workflow depends on a fresh ID per message, provide your own naming or tracking value alongside the mailer flow.
