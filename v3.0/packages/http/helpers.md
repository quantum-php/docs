# Http Helpers

The package exposes a small helper layer in `Quantum\Http\Helpers\http.php`.

## `request()`

```php
function request(): Request
```

Behavior:

1. checks whether `Request::class` is registered in DI
2. registers it if missing
3. returns `Di::get(Request::class)`

That means every caller in the same container receives the same `Request` instance.

## `response()`

```php
function response(): Response
```

Behavior mirrors `request()` and returns the shared `Response` instance for the current container.

## URL helpers

### `base_url(bool $withModulePrefix = false): string`

This is a thin proxy to `request()->getBaseUrl(...)`.

### `current_url(): string`

This proxies `request()->getCurrentUrl()`.

## Redirect helpers

### `redirect(string $url, int $code = StatusCode::FOUND): Response`

This returns `response()->redirect($url, $code)`.

Because it returns the response object, callers can continue mutating headers or body state afterward.

### `redirectWith(string $url, array $data, int $code = StatusCode::FOUND): Response`

This helper stores `$data` into the session under `ReservedKeys::PREV_REQUEST` and then returns a redirect response.

The helper overwrites any previous value already stored under that session key.

## Old input helper

### `old(string $key)`

`old()` reads one key from the session entry created by `redirectWith()`.

Behavior is intentionally consumptive:

1. if the session key does not exist, returns `null`
2. if the stored value is not an array or the requested key is missing, returns `null`
3. otherwise reads the value
4. removes that one key from the stored session array
5. writes the reduced array back into the session
6. returns the value

Practical effect:

- `old('email')` can only return the same stored key once unless something writes it again
- consuming one key leaves the other old-input keys in place

## Referrer helper

### `get_referrer(): ?string`

This is a thin proxy to `request()->getReferrer()`.

## `page_not_found_response()`

```php
function page_not_found_response(): Response
```

This helper chooses between a JSON 404 response and an HTML 404 response.

Decision rule:

- if `request()->getHeader('Accept') === ContentType::JSON`, return JSON
- otherwise, render HTML from `partial('errors' . DS . StatusCode::NOT_FOUND)`

Both branches return status code `404`.

### Important caveat

The JSON branch uses exact string equality.

So headers like these do **not** count as JSON in the current implementation:

- `application/json; charset=utf-8`
- `application/json, text/plain, */*`

Those values fall back to the HTML 404 response path.
