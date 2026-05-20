# Environment Helpers

The package exposes five helper functions.

## `environment()`

```php
function environment(): Environment
```

Behavior:

1. checks whether `Environment::class` is registered in DI
2. registers it if missing
3. returns `Di::get(Environment::class)`

This gives application code access to the shared `Environment` instance.

## `env()`

```php
function env(string $var, $default = null)
```

Behavior:

1. resolves the shared `Environment` instance with `environment()`
2. returns `getValue($var, $default)`

Because it delegates to `getValue()`, it throws until the environment has been loaded.

## `server()`

```php
function server(): Server
```

Behavior:

1. checks whether `Server::class` is registered in DI
2. registers it if missing
3. returns `Di::get(Server::class)`

That means repeated helper calls reuse the same `Server` object for the current container.

## `get_user_ip()`

```php
function get_user_ip(): ?string
```

This is only a small wrapper around `server()->ip()`.

It inherits the same precedence rules and the same proxy trust caveat.

## `getallheaders()` fallback

If PHP does not already provide `getallheaders()`, the package defines one:

```php
function getallheaders(): array
```

The fallback simply returns `server()->getAllHeaders()`.

Two caveats follow from that:

- header names are lowercased and hyphenated instead of keeping original casing
- only `HTTP_*` entries are included, so values like `CONTENT_TYPE` are excluded from the fallback result
