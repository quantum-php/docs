# ResourceCache Contracts

## Service contract

`ViewCache` is a stateful service.

```php
$cache = new ViewCache();
$cache->setup();
```

Call `setup()` before reading or writing entries. That method:

- loads `view_cache` config when needed
- resolves the module-aware cache directory
- applies `ttl`
- applies the minification flag
- creates the cache directory if it does not exist

## Key contract

All cache operations use a string key.

```php
$cache->set('/posts', $html);
$cache->get('/posts');
$cache->delete('/posts');
```

The stored filename is built from:

```text
md5(<key> . session()->getId())
```

Effects that matter in real usage:

- the same key produces different files for different sessions
- changing the session ID changes the cache namespace
- cache hits depend on both the key and the active session

## Read contract

### `getCachedResponse(string $uri): ?Response`

- returns an HTML `Response` when caching is enabled and the cached entry exists
- returns `null` when caching is disabled, the entry is missing, or the entry has expired

This is the main method to use in request handling.

### `get(string $key): ?string`

- returns cached HTML as a string when the entry exists and is still valid
- returns `null` when the entry is missing or expired

`get()` does not wrap the value in a response object.

## Write contract

### `set(string $key, string $content): ViewCache`

- writes the content to the resolved cache file
- returns the same `ViewCache` instance for chaining
- minifies the content first when minification is enabled

The write path does not check `isEnabled()`. If you call `set()` directly, the file is written.

## Expiry contract

### `exists(string $key): bool`

- returns `true` only when the file exists and has not passed its TTL
- deletes the file immediately when it is found expired

### `setTtl(int $ttl): void`

Changes the in-memory TTL used for later expiry checks in the current service instance.

The package does not validate positive values here, so application code should pass a sensible TTL.

## Runtime toggle contract

### `enableCaching(bool $state): void`

Controls whether `getCachedResponse()` will serve cached responses in the current service instance.

### `enableMinification(bool $state): void`

Turns HTML minification on or off for later `set()` calls in the current service instance.

## Failure behavior

These cases matter for integration:

- if minification is enabled and the HTML minifier class is unavailable, `set()` throws `ResourceCacheException::notFound('Package', 'HtmlMin')`
- filesystem read/write/delete failures surface from the storage layer
- config, DI, request, and session helper failures surface from the framework services the package depends on
