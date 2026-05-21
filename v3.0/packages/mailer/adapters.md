# Mailer Adapters

Mailer ships with six adapters.

## `smtp`

`SmtpAdapter` uses PHPMailer over SMTP.

### Expected config shape

The adapter reads these keys from `mailer.smtp`:

```php
[
    'host' => 'smtp.example.com',
    'secure' => 'tls',
    'port' => 587,
    'username' => 'user',
    'password' => 'secret',
]
```

### Extra methods

SMTP is the only adapter with extra composition methods:

- `setReplay(string $email, ?string $name = null)`
- `getReplays()`
- `setCC(string $email, ?string $name = null)`
- `getCCs()`
- `setBCC(string $email, ?string $name = null)`
- `getBCCs()`
- `setAttachment(string $attachment)`
- `getAttachments()`
- `setStringAttachment(string $content, string $filename)`
- `getStringAttachments()`

The method name is literally `setReplay`, not `setReply`.

### Runtime behavior

- in debug mode, PHPMailer SMTP debug output is forwarded to the debugger mails tab through `warning(...)`
- array bodies are concatenated with `implode('')`
- rendered HTML bodies have newline characters stripped before send
- after each send, the adapter clears recipients, headers, and attachments on the PHPMailer instance

## `mailgun`

`MailgunAdapter` posts to `https://api.mailgun.net/v3/<domain>/messages`.

### Expected config shape

`mailer.mailgun` must provide:

```php
[
    'api_key' => 'key-...',
    'domain' => 'mg.example.com',
]
```

### Runtime behavior

- recipients are sent as a comma-separated list of email addresses
- the sender is built as `"<name> <email>"` without angle brackets
- the HTML body is sent in the `html` field
- only from, to, subject, body, and template features are supported

## `mandrill`

`MandrillAdapter` posts to `https://mandrillapp.com/api/1.0/messages/send.json`.

### Expected config shape

`mailer.mandrill` must provide:

```php
[
    'api_key' => '...',
]
```

### Runtime behavior

- recipients are forwarded as the collected address arrays
- `from_name` is omitted when no sender name was set
- the HTML body is sent in `message.html`
- only from, to, subject, body, and template features are supported

## `sendgrid`

`SendgridAdapter` posts to `https://api.sendgrid.com/v3/mail/send`.

### Expected config shape

`mailer.sendgrid` must provide:

```php
[
    'api_key' => 'SG....',
]
```

### Runtime behavior

- sender data is passed through as the `from` object
- recipients are wrapped in one `personalizations[0].to` array
- the HTML body is sent as a `text/html` content item
- only from, to, subject, body, and template features are supported

## `sendinblue`

`SendinblueAdapter` posts to `https://api.sendinblue.com/v3/smtp/email`.

### Expected config shape

`mailer.sendinblue` must provide:

```php
[
    'api_key' => '...',
]
```

### Runtime behavior

- sender data is passed as `sender`
- recipients are forwarded as the collected address arrays
- the HTML body is sent as `htmlContent`
- only from, to, subject, body, and template features are supported

## `resend`

`ResendAdapter` posts to `https://api.resend.com/emails`.

### Expected config shape

`mailer.resend` must provide:

```php
[
    'api_key' => 're_...',
]
```

### Runtime behavior

- the sender is formatted as `Name <email>` when a name exists, otherwise just the email address
- recipients are reduced to a flat array of email strings
- the HTML body is sent in the `html` field
- only from, to, subject, body, and template features are supported

## Shared API-adapter caveats

The API adapters all share these limits:

- they use `HttpClient` directly and catch transport exceptions internally
- `send()` reports failure as `false`; provider-specific error details come from `HttpClient::getErrors()`
- they do not expose reply-to, CC, BCC, file attachments, or string attachments through the package surface
- array bodies are concatenated with `implode('')` before send
- template and raw body output is trimmed and newline-stripped before being sent as HTML