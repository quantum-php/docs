# Mailer Architecture

The Mailer package follows a short resolution pipeline:

1. resolve a mailer through `MailerFactory`
2. lazy-load the `mailer` config on first use when needed
3. reuse or create a `Mailer` wrapper for the chosen adapter
4. proxy fluent mail-building calls to the adapter
5. call `send()` on the adapter and then reset message fields

## Factory lifecycle

`MailerFactory::get()` registers the factory in DI on first use and then resolves it from the container.

That gives the package a shared factory instance for the life of the container. The factory keeps an in-memory cache:

```php
private array $instances = [];
```

The practical effect is:

- the first call for an adapter builds the wrapper and adapter
- later calls for the same adapter reuse the same `Mailer` object

## Config loading behavior

`MailerFactory::resolve()` imports the `mailer` config only when `config()->has('mailer')` is false.

After that, it reads:

- `mailer.default` for the default adapter name
- `mailer.<adapter>` for adapter-specific constructor parameters
- `mailer.mail_trap` during `send()` to decide whether to save or deliver

## Wrapper behavior

`Quantum\Mailer\Mailer` is only a proxy.

It forwards calls to the underlying adapter with `__call()`. If the adapter does not implement a method, the package throws a mailer exception instead of failing silently.

That matters for adapter-specific features such as attachments: the wrapper does not normalize feature differences for you.

## Shared send lifecycle

`MailerTrait::send()` does the same high-level work for every adapter:

1. call `prepare()` to translate the fluent fields into transport-specific payload data
2. choose `saveEmail()` when `mailer.mail_trap` is truthy, otherwise `sendEmail()`
3. reset the common message fields immediately after the attempt
4. log transport errors when the send failed

The reset happens on both success and failure, so you cannot call `send()` twice on the same composed message without rebuilding it.

## Template rendering rules

When a template is set, the trait renders it by:

1. extracting array body data into local variables
2. requiring `<templatePath>.php`
3. capturing the output buffer as the message body

There is no view-engine abstraction here. The template is a plain PHP file include.

## Message ID behavior

The trait stores the generated message ID in a static property.

That means the generated ID is reused for later sends from the same adapter class in the same PHP process unless the adapter overrides the behavior internally. This is especially visible when mail trap is enabled, because the message ID is also used as the saved filename.

## Mail trap flow

When `mailer.mail_trap` is enabled, the package does not contact the remote transport.

Instead it:

- optionally lets the adapter prepare a rendered MIME message first
- resolves `MailTrap` from DI
- writes `<message-id>.eml` into `shared/emails`

If `shared/emails` does not already exist as a directory, saving fails and `send()` returns `false`.

## Transport differences that affect usage

The SMTP adapter keeps an internal PHPMailer instance and clears addresses, headers, and attachments after each send.

The API adapters build request payload arrays and send them through `Quantum\HttpClient\HttpClient`. They do not expose SMTP-only helpers such as CC or attachments.