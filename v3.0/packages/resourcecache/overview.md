# ResourceCache

The ResourceCache package stores rendered HTML responses on disk so repeated requests can skip view rendering work.

Use it when you want simple full-page caching for HTML endpoints, especially pages that are expensive to render and benefit from a short-lived per-visitor cache.

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

- `resource_cache` turns cached responses on or off for the whole application
- `view_cache` controls storage details

A route can override both for its own page, see [Per-route caching](#per-route-caching).

On `setup()`, the package lazily imports `config/view_cache.php` if it has not been loaded yet.

Whether caching is on is decided when you create the `ViewCache` instance: from the matched route's `cacheable()` setting when it has one, otherwise from `resource_cache`. In a web request the framework creates the instance after the route is matched. If you construct the cache yourself earlier, create it after config bootstrap or call `enableCaching(true)` for that instance.

Supported `view_cache` options used by this package:

- `cache_dir` - base cache directory relative to `base_dir()`; defaults to `cache`
- `ttl` - entry lifetime in seconds; defaults to `300`; a route's `cacheable()` TTL replaces it for that route
- `minify` - whether HTML is minified before saving; defaults to `false`

### Per-route caching

The global switch fits most pages, but not all of them. An account settings page must always show fresh data, even when the rest of the site is cached, while a page that is slow to render and rarely changes is worth caching even when caching is off elsewhere. Declare that on the route with `cacheable()`:

```php
return function ($route) {
    // Cached for 10 minutes, even when resource_cache is off
    $route->get('about', 'PageController', 'about')->cacheable(true, 600);

    // Never cached, even when resource_cache is on
    $route->get('account-settings', 'AccountController', 'form')->cacheable(false);
};
```

- `cacheable(true)` caches the route's page whatever `resource_cache` says, and `cacheable(false)` leaves it uncached.
- The second argument is the TTL in seconds for that route's page. Without it, the page uses `view_cache.ttl`.
- Routes without `cacheable()` follow `resource_cache`.
- Called after a group, `cacheable()` applies to every route of the group, see [Group-level configuration](../../core-concepts/routing.md#group-level-configuration).

The route setting is read by `ViewCache` itself: its constructor takes `enabled` and `setup()` takes the TTL from `request()->getRouteCacheSettings()`, which is also available as `route_cache_settings()`.

## Cache layout

Cache files are stored under:

- `base_dir()/<cache_dir>/views` for shared requests
- `base_dir()/<cache_dir>/views/<module>` when the current request has a module

The module name is lowercased for the directory name.

This means identical cache keys are separated by current module automatically.

## Important contracts

- Cache file names are derived from the cache key plus the current session ID.
- Cached HTML is therefore visitor-scoped by default.
- Expired files are removed the first time the package checks them after their TTL passes.
- `getCachedResponse()` serves cached output when caching is enabled for the current `ViewCache` instance.
- Direct methods such as `set()`, `get()`, and `delete()` keep working regardless of that read toggle.

## Common pitfalls

### Always call `setup()` before using the cache

`setup()` loads config, decides the cache directory, and creates that directory when missing.

If you skip it, cache file paths are not initialized correctly.

### Plan keys around visitor-scoped cache files

The package includes `session()->getId()` in the cache file name.

That makes the built-in cache a good fit for per-visitor HTML. For shared page caching across all users, use a different cache layer.

### Enable minification when the HTML minifier package is available

When minification is enabled, `set()` expects the `voku\helper\HtmlMin` package to be installed. If it is missing, the write raises a resource-cache exception.

