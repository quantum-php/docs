# Session Adapters

Quantum ships two built-in session adapters. Both expose the same public Session API, but their storage and lifecycle behavior differ in ways that matter for integration.

## Native adapter

Use the native adapter when standard PHP session storage is enough for your app.

```php
$session = session('native');
$session->set('cart_id', 'abc123');
```

### Config contract

When the factory resolves `native`, it passes `session.native` into `NativeSessionAdapter`.

The adapter reads one package-specific option:

- `timeout` — idle timeout in seconds, default `1800` (30 minutes)

### Runtime behavior

The native adapter:

- starts a PHP session if one is not already active
- keeps an internal `LAST_ACTIVITY` timestamp in the session
- destroys the session when the idle time exceeds `timeout`
- updates `LAST_ACTIVITY` on every initialization

Practical effect: the timeout is checked when the adapter is initialized, not by a background cleanup process.

### Caveats

- `all()` includes the adapter's internal `LAST_ACTIVITY` key because it reads the full session storage
- if `session_start()` fails, resolution throws a session exception
- if the adapter tries to destroy an expired session and `session_destroy()` fails, resolution throws a session exception

## Database adapter

Use the database adapter when you want session state stored in a database table instead of PHP's default session store.

```php
$session = session('database');
$session->set('wizard.step', 2);
```

### Config contract

When the factory resolves `database`, it passes `session.database` into `DatabaseSessionAdapter`.

The adapter reads one package-specific option:

- `table` — session table name, default `sessions`

### Table contract

The database handler reads and writes these fields:

- `session_id`
- `ttl`
- `data`

Your chosen table must support that shape.

### Runtime behavior

The database adapter:

- creates a dynamic model for the configured table through the Model package
- registers a custom PHP session save handler before starting the session
- stores the raw PHP session payload in `data`
- updates `ttl` to the current Unix timestamp on every write
- deletes expired rows during garbage collection when `ttl < time() - max_lifetime`

### Caveats

- this adapter depends on the Database and Model packages being configured correctly
- expiry cleanup depends on PHP session garbage collection calling the handler's `gc()` method
- the package does not create the session table for you

## Choosing an adapter

Use `native` when you want the simplest setup and default PHP session handling.

Use `database` when you need a shared or centrally managed session store and are willing to provide the backing table and database configuration.