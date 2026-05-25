# Cache

Cache gives you a PSR-16 style API for short-lived application data without tying your code to one backend.

Use it for things like computed fragments, lookup results, throttling support data, or other values you can safely rebuild.

## Entry point

Use the `cache()` helper.

```php
cache()->set('settings.homepage', $payload, 300);

$payload = cache()->get('settings.homepage');
```

`cache()` returns a `Quantum\Cache\Cache` wrapper. When you do not pass an adapter name, the factory uses `cache.default` from `config/cache.php`.

## Supported adapters

Quantum ships four built-in adapters:

- `file`
- `database`
- `memcached`
- `redis`

The factory keeps one resolved `Cache` instance per adapter name for the life of the current DI-managed factory instance. Repeated calls like `cache('redis')` reuse the same wrapper and underlying adapter.

## What the package guarantees

- cache config is loaded lazily on first use
- all built-in adapters serialize values before storage
- `null` TTL uses the adapter's configured default TTL
- unsupported adapter names fail during resolution
- unsupported forwarded method calls fail on the wrapper

## Important caveats

- `clear()` is backend-wide for the configured store. It is not limited to the current prefix or to keys created by one caller.
- batch methods accept arrays only, even though the PSR signatures say `iterable`
- expiry cleanup is lazy for file and database storage: expired entries are removed when they are checked

## Read next

- [Adapters](adapters.md)
- [Contracts](contracts.md)
- [Usage](usage.md)
