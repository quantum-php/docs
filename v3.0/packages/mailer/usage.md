# Mailer Usage

## Send a basic HTML email

For most application code, compose the message fluently and call `send()` once:

```php
mailer()
    ->setFrom('noreply@example.com', 'Example App')
    ->setAddress('jane@example.com', 'Jane')
    ->setSubject('Welcome')
    ->setBody('<p>Thanks for signing up.</p>')
    ->send();
```

The package does not add a text alternative automatically. Every adapter sends HTML-oriented content.

## Render the body from a PHP template

Use `setTemplate()` when you want the body to come from a PHP file:

```php
mailer()
    ->setFrom('noreply@example.com', 'Example App')
    ->setAddress('jane@example.com', 'Jane')
    ->setSubject('Reset your password')
    ->setTemplate(base_dir() . DS . 'shared' . DS . 'resources' . DS . 'emails' . DS . 'reset-password')
    ->setBody([
        'name' => 'Jane',
        'resetUrl' => $url,
    ])
    ->send();
```

The package requires `reset-password.php`, extracts the body array into local variables, and captures the rendered output.

## Send through a specific adapter

When you need a non-default transport, pass its adapter name explicitly:

```php
use Quantum\Mailer\Enums\MailerType;

mailer(MailerType::RESEND)
    ->setFrom('noreply@example.com', 'Example App')
    ->setAddress('team@example.com')
    ->setSubject('Deployment complete')
    ->setBody('<p>Production is healthy.</p>')
    ->send();
```

This still returns the same `Mailer` wrapper shape. Only the underlying adapter changes.

## Use SMTP-only features

Reply-to, CC, BCC, and attachments exist only on the SMTP adapter:

```php
use Quantum\Mailer\Enums\MailerType;

mailer(MailerType::SMTP)
    ->setFrom('noreply@example.com', 'Example App')
    ->setAddress('jane@example.com', 'Jane')
    ->setCC('manager@example.com', 'Manager')
    ->setBCC('audit@example.com')
    ->setAttachment(base_dir() . DS . 'storage' . DS . 'reports' . DS . 'report.pdf')
    ->setSubject('Monthly report')
    ->setBody('<p>Attached.</p>')
    ->send();
```

For inline content from memory, use `setStringAttachment($content, $filename)`.

If you need reply-to, the method name is `setReplay()` in this package.

## Enable local mail trapping

When `mailer.mail_trap` is truthy, `send()` saves a `.eml` file to `shared/emails` instead of contacting the transport.

That is useful for local development and tests where you want to inspect the generated message.

You can then parse a saved message with `MailTrap`:

```php
use Quantum\Mailer\MailTrap;
use Quantum\Di\Di;

if (!Di::isRegistered(MailTrap::class)) {
    Di::register(MailTrap::class);
}

$mail = Di::get(MailTrap::class)->parseMessage($messageId);
$subject = $mail->getParsedSubject();
$body = $mail->getParsedBody();
```

## Practical caveats

- Build the full message before calling `send()`. The adapter state is cleared immediately after the send attempt.
- `shared/emails` must already exist when mail trap is enabled, or saving fails.
- In mail-trap mode, a non-template array body is not rendered into the saved `.eml` body unless the adapter provides its own rendered MIME message.
- The package logs transport errors through `warning(..., ['tab' => Debugger::MAILS])`, so debugger output is the main built-in failure detail channel.
- Because message IDs are cached in static state, long-running workers should not rely on this package to generate a fresh local mail-trap filename for every send.