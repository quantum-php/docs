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

This still returns the same `Mailer` wrapper shape. The adapter name selects the transport behind it.

## Use SMTP-only features

Reply-to, CC, BCC, and attachments exist on the SMTP adapter:

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

That is useful for local development and tests where you want to inspect the generated message. Create the `shared/emails` directory as part of project setup so each saved message has a destination.

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

## Reuse a cached adapter safely

`mailer()` reuses one wrapper per adapter name, so treat each send as a full composition step:

```php
use Quantum\Mailer\Enums\MailerType;

$mailer = mailer(MailerType::RESEND);

foreach ($recipients as $recipient) {
    $mailer
        ->setFrom('noreply@example.com', 'Example App')
        ->setAddress($recipient['email'], $recipient['name'])
        ->setSubject('Weekly digest')
        ->setBody('<p>Your digest is ready.</p>')
        ->send();
}
```

This keeps the current subject and body explicit on every message, which matches the package's shared-instance lifecycle.

## Practical caveats

- Build the full message before calling `send()`. The shared fluent fields reset after each attempt, and composing every field on every message keeps reused adapters predictable.
- Create `shared/emails` before enabling mail trap so saved `.eml` files have a local destination.
- In mail-trap mode, a non-template array body produces an empty generated body unless the adapter supplies its own rendered MIME message.
- Transport errors are mirrored into the debugger mails tab, so debugger output is the built-in place to inspect delivery details.
- Because message IDs are cached in static state, long-running workers should treat the generated local mail-trap filename as reusable state and provide their own unique naming strategy when needed.
