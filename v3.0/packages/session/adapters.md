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
- refreshes the session when the idle time is within `timeout`
- resets the active session when the idle time exceeds `timeout`
- updates `LAST_ACTIVITY` on every initialization

Practical effect: the timeout is checked when the adapter is initialized, not by a background cleanup process.

### Caveats

- `all()` includes the adapter's internal `LAST_ACTIVITY` key because it reads the full session storage.
- Session values are stored as encrypted payloads, so direct inspection of the backing storage is best treated as transport data rather than app-level values.
- When PHP session startup or teardown raises an error, Session surfaces it as a session exception.

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

- `session_id` (lookup key)
- `data` (raw PHP session payload)
- `ttl` (last-write Unix timestamp)

A practical schema (from framework tests) is:

```sql
CREATE TABLE sessions (
    id INTEGER PRIMARY KEY,
    session_id VARCHAR(255) UNIQUE,
    data TEXT,
    ttl INTEGER
);
```

Notes:

- `session_id` should be unique.
- `ttl` is updated on every write and used by GC cleanup (`ttl < time() - max_lifetime`).
- You can use a different table name via `session.database.table`, but it must expose equivalent columns.

### Runtime behavior

The database adapter:

- creates a dynamic model for the configured table through the Model package
- registers a custom PHP session save handler before starting the session
- stores the PHP session payload in `data`
- updates `ttl` to the current Unix timestamp on every write
- deletes expired rows during garbage collection when `ttl < time() - max_lifetime`

Because Session encrypts and serializes values before they reach `$_SESSION`, the `data` column contains PHP's session payload format around encrypted value strings.

### Caveats

- This adapter depends on the Database and Model packages being ready before the first `session('database')` call.
- Expiry cleanup runs when PHP session garbage collection calls the handler's `gc()` method.
- Create the session table as part of your database setup before you switch the default adapter.

## Choosing an adapter

Use `native` when you want the simplest setup and default PHP session handling.

Use `database` when you need a shared or centrally managed session store and are willing to provide the backing table and database configuration.