# ResourceCache Usage

## Cache a rendered page

The package fits best around rendered HTML pages.

```php
use Quantum\Renderer\Factories\RendererFactory;
use Quantum\ResourceCache\ViewCache;

$cache = new ViewCache();
$cache->setup();

$key = request()->getPath();

if ($response = $cache->getCachedResponse($key)) {
    return $response;
}

$html = RendererFactory::get()->render('posts/index', [
    'posts' => $posts,
]);

$cache->set($key, $html);

return response()->html($html);
```

Use a key that matches the page variant you want to cache.

Because the package already scopes files by session ID, a route path is often enough for user-specific pages.

## Change TTL for one cache instance

```php
$cache = new ViewCache();
$cache->setup();
$cache->setTtl(900);
```

Use this when one code path needs a different lifetime than the configured default.

The new TTL only affects this `ViewCache` instance.

## Toggle caching dynamically

```php
$cache->enableCaching(app()->isProduction());
```

This only changes whether `getCachedResponse()` serves cached output.

It does not prevent direct writes through `set()`.

## Enable HTML minification

```php
$cache->setup();
$cache->enableMinification(true);
$cache->set($key, $html);
```

Use this when you want smaller cached HTML files.

Make sure the `voku/helper` HTML minifier dependency is available before enabling it.

## Remove a cached entry

```php
$cache->delete('/posts');
```

Use this after content updates when you know the old rendered page is stale.

Remember that deletion targets the current session's cache file for that key.

## Common pitfalls

### Include all meaningful page variants in your key

The package does not inspect query strings, locale, or custom request state for you.

If `/posts?page=2` should be cached separately from `/posts?page=1`, build that into the key yourself.

### Know when module context changes the storage path

If the current request has a module, files are stored under that module's cache directory.

That means the same key can resolve to different cache files depending on the active module.

### Expect lazy cleanup, not scheduled cleanup

Expired files are removed when the package checks them.

The package does not include a background sweeper for old cache files.
