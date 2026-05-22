# ResourceCache

The ResourceCache package stores rendered HTML responses on disk so repeated requests can skip view rendering work.

Use it when you want simple full-page view caching for HTML endpoints, especially pages that are expensive to render but safe to serve from a short-lived cache.

## What the package provides

The package is centered on one service:

- `Quantum\ResourceCache\ViewCache`

It can:

- read a cached HTML response for a request key
- store rendered HTML to disk
- expire entries automatically by TTL
- optionally minify HTML before saving

## Basic flow

```php
use Quantum\ResourceCache\ViewCache;

$cache = new ViewCache();
$cache->setup();

if ($response = $cache->getCachedResponse(request()->getPath())) {
    return $response;
}

$html = RendererFactory::get()->render('home/index', ['posts' => $posts]);

$cache->set(request()->getPath(), $html);

return response()->html($html);
```

`getCachedResponse()` returns a ready-made HTML `Response` when a valid cached entry exists. Otherwise it returns `null`.

## Configuration

The package reads two config areas:

- `resource_cache` controls whether cached responses are used
- `view_cache` controls storage details

On `setup()`, the package lazily imports `config/view_cache.php` if it has not been loaded yet.

Supported `view_cache` options used by this package:

- `cache_dir` - base cache directory relative to `base_dir()`; defaults to `cache`
- `ttl` - entry lifetime in seconds; defaults to `300`
- `minify` - whether HTML is minified before saving; defaults to `false`

## Cache layout

Cache files are stored under:

- `base_dir()/<cache_dir>/views` for shared requests
- `base_dir()/<cache_dir>/views/<module>` when the current request has a module

The module name is lowercased for the directory name.

This means identical cache keys are separated by current module automatically.

## Important contracts

- Cache file names are derived from the cache key plus the current session ID.
- Cached HTML is therefore session-scoped, not shared across all visitors.
- Expired files are deleted the first time they are checked after expiry.
- `getCachedResponse()` only returns a cached response when caching is currently enabled.
- Direct methods such as `set()`, `get()`, and `delete()` still work even if global caching is disabled.

## Common pitfalls

### Always call `setup()` before using the cache

`setup()` loads config, decides the cache directory, and creates that directory when missing.

If you skip it, cache file paths are not initialized correctly.

### Do not expect cross-session page sharing

The package includes `session()->getId()` in the cache file name.

If you want one shared page cache for all users, this package does not provide that behavior.

### Only enable minification when the HTML minifier package is available

If minification is enabled but `voku\helper\HtmlMin` is not installed, saving content fails with a resource-cache exception.

## Read next

- [Contracts](contracts.md)
- [Usage](usage.md)
