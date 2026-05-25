# Cookie Helpers

## `cookie()`

```php
function cookie(): Cookie
```

Use this helper as the default entry point for cookie operations.

```php
cookie()->set('locale', 'en', 3600);
$locale = cookie()->get('locale');
```

## Helper behavior

- resolves a `Quantum\Cookie\Cookie` instance through the DI container
- creates the instance on first use with the current `$_COOKIE` storage
- reuses the same wrapper for later helper calls in the same container lifecycle

Because the wrapper is created around `$_COOKIE`, helper reads and writes operate on the request cookie bag plus any changes made through the package during the same request.

Prefer this helper over constructing `Cookie` manually unless you are testing with custom storage.
