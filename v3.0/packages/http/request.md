# Http Request

## Purpose

`Quantum\Http\Request` is Quantum's mutable snapshot of the current HTTP request.

It combines server-derived metadata with helper methods for:

- request body values
- headers
- files
- query strings and URL segments
- matched-route metadata
- synthetic internal requests for testing-style flows

## Method and URL state

The request object stores:

- method
- protocol
- host
- port
- URI
- raw query string

`setMethod()` validates against `Request::METHODS` and throws `HttpException` for unsupported methods.

Supported methods are currently limited to:

- `GET`
- `POST`
- `PUT`
- `PATCH`
- `DELETE`

`isMethod()` compares case-insensitively, so callers can safely check `isMethod('post')` even if the stored value is uppercase.

## Base URL and current URL

`getBaseUrl(bool $withModulePrefix = false)` first reads `config()->get('app.base_url')`.

If that config value exists, it returns that base URL and optionally appends the matched route prefix.

If the config value is empty, it falls back to a host prefix built from protocol, host, and port.

Port handling is conservative:

- port `80` is omitted for `http`
- port `443` is omitted for `https`
- any other port is included

`getCurrentUrl()` always uses the current protocol/host/port snapshot plus the current URI and raw query string.

## Body parameter access

The request body store lives in an internal array and is accessed with:

- `has($key)`
- `get($key, $default = null, $raw = false)`
- `set($key, $value)`
- `all()`
- `delete($key)`

### Sanitization contract

`get()` strips HTML tags by default.

- scalar values are passed through `strip_tags()`
- array values are transformed with `array_map('strip_tags', $value)`
- raw values are returned unchanged only when `$raw = true`

That means `get()` is not a pure retrieval API. It performs output-oriented sanitization unless you opt out.

### Reserved key guard

`set()` rejects the reserved key stored in `Quantum\App\Enums\ReservedKeys::RENDERED_VIEW`.

Trying to write that key raises `InvalidArgumentException`.

### `all()` behavior

`all()` returns merged request parameters plus uploaded files.

If a key exists in both payload data and files, the later merge from the files array wins.

## Input parsing and precedence

`setRequestParams()` rebuilds the request payload by merging five sources in order:

1. `getParams()` from `$_GET`
2. `postParams()` from `$_POST`
3. `jsonPayloadParams()`
4. `urlEncodedParams()`
5. explicit parsed params passed into `setRequestParams()`

This makes raw multipart parameters the highest-precedence source during normal bootstrap.

### JSON payload parsing

JSON parsing runs only when both conditions match:

- method is `PUT`, `PATCH`, or `POST`
- normalized content type is exactly `application/json`

Invalid JSON quietly becomes an empty array because `json_decode(..., true) ?: []` is used.

### URL-encoded raw body parsing

URL-encoded raw body parsing uses the same method gate and requires content type `application/x-www-form-urlencoded`.

The implementation applies `urldecode()` before `parse_str()`. Callers get the parsed array only; there is no separate raw representation.

### Multipart raw parsing

Raw multipart parsing runs only when both conditions match:

- method is `PUT`, `PATCH`, or `POST`
- normalized content type is exactly `multipart/form-data`

The parser extracts the multipart boundary from `server()->contentType()` and then processes each block as either:

- a normal parameter
- a file part
- an octet-stream field

Notable details from the parser:

- fields named like `tags[]` are accumulated into arrays
- file parts are written to temporary files under the system temp directory
- those temp files are registered for removal with `register_shutdown_function()`
- file parts with empty content are skipped
- array-like file names such as `photos[]` or `photos[cover]` become nested file collections

## Uploaded files

`setUploadedFiles()` merges normalized `$_FILES` with parsed raw multipart files.

`handleFiles()` converts each entry into `Quantum\Storage\UploadedFile` objects.

It supports:

- single uploads -> one `UploadedFile`
- multi-file top-level arrays -> `array<UploadedFile>`

`hasFile($key)` returns `true` only when the key exists and every uploaded file under that key has `UPLOAD_ERR_OK`.

`getFile($key)` throws `FileUploadException::fileNotFound(...)` when that check fails.

## Header access

Request headers are stored with lowercase keys, but lookup is tolerant.

`hasHeader()` and `getHeader()` normalize the requested key into both hyphen and underscore forms, so these lookups are treated as equivalent:

- `Content-Type`
- `content-type`
- `CONTENT_TYPE`

### Authorization helpers

`getAuthorizationBearer()` returns the token only when the `Authorization` header matches `Bearer <token>`.

`getBasicAuthCredentials()` prefers server variables `PHP_AUTH_USER` and `PHP_AUTH_PW`. If those are missing, it falls back to decoding a `Basic <base64>` authorization header.

Invalid or non-decodable Basic auth values return `null`.

### AJAX and referrer helpers

`isAjax()` returns `true` when either of these is true:

- header `X-REQUESTED-WITH` exists
- `server()->ajax()` returns true

`getReferrer()` simply proxies `server()->referrer()`.

## Query string helpers

The query helpers work on the raw stored query string, not on a decoded map.

`getQueryParam($key)`:

- splits on `&`
- splits each pair on `=`
- returns the first matching raw value
- does not URL-decode the value

`setQueryParam($key, $value)` always appends a new `key=value` pair.

It does not replace existing keys and does not encode the value.

## URI segments

`getUri()` stores the request URI without a leading slash.

`getAllSegments()` parses the URI path, trims outer slashes, and prepends a sentinel element:

```php
['zero_segment', ...actualSegments]
```

That means segment access is effectively 1-based for real path parts.

`getSegment(1)` returns the first real path segment.

If the URI is `null`, `getAllSegments()` returns `['zero_segment']`.

## CSRF token lookup

`getCsrfToken()` checks the request payload first and then the header `X-<TOKEN_KEY>`.

The first match wins.

## Route metadata access

The request can hold a `Quantum\Router\MatchedRoute` instance.

From that object, the package exposes read helpers for:

- current middlewares
- current module
- current controller
- current action
- route closure callback
- original route pattern
- compiled route pattern
- route parameters
- route cache settings
- route name
- route prefix

If no route has been set, these helpers return `null` or `[]` depending on the method.

### Route collection lookups

`findRouteByName($name, $module)` and `routeGroupExists($name, $module)` only work when `RouteCollection::class` has already been registered in DI.

If not, they return `null` or `false` instead of constructing anything.

Both lookups are case-insensitive for the requested name and module.

### Module namespace helper

`getModuleBaseNamespace()` hardcodes two environments:

- testing -> `Quantum\\Tests\\_root\\modules`
- everything else -> `Modules`

## Internal request creation

`create($method, $url, $params = [], $headers = [], $files = [])` rewrites the shared server state and rebuilds the request object from it.

It is intended for internal or testing-style request simulation.

The method performs these steps:

1. parses the target URL
2. flushes the shared server object
3. writes request method, URI, scheme, host, port, and query into that server object
4. infers content type from the presence of params or files
5. writes custom headers as `HTTP_*` server entries
6. flushes the request object's stored headers/body/files/URL pieces
7. repopulates the request from the rewritten server state
8. optionally overwrites params and files with the explicit arrays passed in

Content-type inference is simple:

- files present -> `multipart/form-data`
- params present -> `application/x-www-form-urlencoded`
- neither -> `text/html`

## Flush behavior

`flush()` clears:

- headers
- request payload
- files
- protocol
- host
- port
- URI
- query string

It is not a full reset helper. It does not clear the matched route property directly.
