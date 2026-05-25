# Cache Usage

Use Cache when you want simple read-through and write-through storage behind one helper.

## Store and read a value

```php
cache()->set('homepage.featured-posts', $posts, 300);

$posts = cache()->get('homepage.featured-posts', []);
```

Pass a default value to `get()` when your code should keep working on a cache miss.

## Choose a backend explicitly

```php
$fileCache = cache('file');
$redisCache = cache('redis');
```

Use an explicit adapter when one part of the app must use a different backend than `cache.default`.

Repeated calls for the same adapter reuse the same factory-managed wrapper during the current runtime.

## Use a `DateInterval` TTL

```php
$ttl = new DateInterval('PT15M');

cache()->set('report.summary', $summary, $ttl);
```

This is useful when your app already works with interval objects instead of raw seconds.

## Work with multiple keys

```php
cache()->setMultiple([
    'nav.main' => $nav,
    'footer.links' => $links,
], 600);

$fragments = cache()->getMultiple([
    'nav.main',
    'footer.links',
], []);
```

Use arrays for batch operations. Generators and other iterable objects are rejected.

## Invalidate carefully

```php
cache()->delete('homepage.featured-posts');
```

Prefer targeted deletes.

`clear()` is a broad operation:

- file clears the whole configured directory
- database clears the whole configured table
- Memcached flushes the server
- Redis flushes the selected database

In shared environments, `clear()` can remove unrelated cache entries.

## Choose the right backend

- choose `file` for a simple single-host cache
- choose `database` when you want cache state in your relational data store
- choose `memcached` or `redis` when multiple workers or servers must share cache state

## Common pitfalls

- do not rely on storage-level key names; built-in adapters hash them with the configured prefix
- make sure the database adapter's table already exists
- handle external service failures when using Memcached or Redis
- treat corrupted cache data as a normal miss; the built-in adapters delete unreadable entries automatically
