# Mailer Helpers

The package exposes one global resolver helper.

## `mailer()`

```php
function mailer(?string $adapter = null): Mailer
```

Use this when you want the shared `Quantum\Mailer\Mailer` wrapper.

```php
mailer()
    ->setFrom('noreply@example.com', 'Example App')
    ->setAddress('jane@example.com', 'Jane')
    ->setSubject('Welcome')
    ->setBody('<p>Hello</p>')
    ->send();
```

Pass an adapter name when you need a specific transport:

```php
use Quantum\Mailer\Enums\MailerType;

mailer(MailerType::SMTP)
    ->setFrom('noreply@example.com', 'Example App')
    ->setAddress('ops@example.com')
    ->setSubject('Nightly report')
    ->setBody('<p>Done</p>')
    ->send();
```

## Helper behavior

A few limits are easy to miss:

- `mailer()` resolves through `MailerFactory::get()`, so repeated calls reuse the cached wrapper for that adapter name
- the returned object is a proxy, not the adapter itself
- adapter-specific methods work only when the current adapter implements them
- unsupported method calls throw a mailer exception

Example of using an SMTP-only method:

```php
mailer(MailerType::SMTP)
    ->setFrom('noreply@example.com', 'Example App')
    ->setAddress('jane@example.com')
    ->setReplay('support@example.com', 'Support')
    ->send();
```

If you switch that example to a non-SMTP adapter, the proxy call will fail because the method does not exist on that adapter.