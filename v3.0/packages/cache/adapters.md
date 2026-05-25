# Cache Adapters

Quantum's cache package exposes one API across four backends. Pick the adapter based on where cache state must live and what scope `clear()` is allowed to affect.

## Choosing an adapter

- Use `file` for a simple local cache on one machine.
- Use `database` when you want cache state in an application database table.
- Use `memcached` for an external shared cache server.
- Use `redis` for an external shared cache database.

## File adapter

Use the file adapter when local disk storage is enough.

```php
$cache = cache('file');
$cache->set('reports.monthly', $data, 600);
```

### Config contract

`FileAdapter` reads these keys from `cache.file`:

- `path` - directory where cache files are stored
- `ttl` - default TTL in seconds
- `prefix` - string included in the hashed key namespace

### Runtime behavior

- values are serialized into files under `path`
- expiry is stored in the file modification time
- expired files are deleted when `has()` or `get()` checks them
- unreadable or invalid serialized content is deleted and treated as a cache miss

### Caveats

- `clear()` deletes every file under the configured directory, not just files for the current prefix
- missing keys return `false` from `delete()`
- an empty cache directory makes `clear()` return `false`

## Database adapter

Use the database adapter when you want cache state in a table managed by the Database and Model packages.

```php
$cache = cache('database');
$cache->set('dashboard.stats', $stats, 300);
```

### Config contract

`DatabaseAdapter` reads these keys from `cache.database`:

- `table` - table name used for cache rows
- `ttl` - default TTL in seconds
- `prefix` - string included in the hashed key namespace

### Table contract

The adapter reads and writes these fields:

- `key`
- `value`
- `ttl`

A practical schema is:

```sql
CREATE TABLE cache (
    id INTEGER PRIMARY KEY,
    key VARCHAR(255) UNIQUE,
    value TEXT,
    ttl INTEGER
);
```

### Runtime behavior

- each cache key is stored as one row
- existing rows are updated in place
- expiry is checked against the stored Unix timestamp in `ttl`
- expired rows are deleted lazily when checked

### Caveats

- this adapter depends on the Model package being able to create a dynamic model for the configured table
- the package does not create the table for you
- `clear()` deletes rows through the model's bulk delete operation for the whole table

## Memcached adapter

Use the Memcached adapter when multiple workers or servers must share cache state through Memcached.

```php
$cache = cache('memcached');
$cache->set('feed.home', $html, 120);
```

### Config contract

`MemcachedAdapter` reads these keys from `cache.memcached`:

- `host`
- `port`
- `ttl` - default TTL in seconds
- `prefix` - string included in the hashed key namespace

### Runtime behavior

- the adapter opens one Memcached client and adds the configured server
- if `getStats()` fails, adapter construction throws a cache exception
- values are stored as serialized strings with the normalized TTL

### Caveats

- `clear()` calls `flush()` on the Memcached server, so it is not prefix-scoped
- the built-in adapter only configures one host and one port
- network and extension-level failures surface from the Memcached client

## Redis adapter

Use the Redis adapter when you want shared cache state in Redis.

```php
$cache = cache('redis');
$cache->set('api.schema', $schema, 3600);
```

### Config contract

`RedisAdapter` reads these keys from `cache.redis`:

- `host`
- `port`
- `ttl` - default TTL in seconds
- `prefix` - string included in the hashed key namespace

### Runtime behavior

- the adapter connects directly to the configured host and port
- values are stored as serialized strings with the normalized TTL
- `delete()` maps to Redis `DEL`

### Caveats

- `clear()` calls `flushdb()`, so it clears the entire selected Redis database
- the built-in adapter does not configure authentication, database selection, or other Redis options
- Redis connection and command failures bubble as Redis client exceptions

## Shared adapter behavior

All built-in adapters share these contracts:

- stored keys are namespaced through `sha1($prefix . $key)`
- `get()` returns the provided default when the key is missing, expired, or contains invalid serialized data
- `getMultiple()`, `setMultiple()`, and `deleteMultiple()` require arrays and throw `InvalidArgumentException` for other iterables
- `DateInterval` TTL values are converted to seconds at call time
