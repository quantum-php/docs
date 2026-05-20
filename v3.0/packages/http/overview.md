# Http

The Http package provides Quantum's concrete request and response objects plus a small helper layer around them.

At package level, it is built from two runtime objects:

- `Quantum\Http\Request` for inbound method, URL, headers, input data, uploaded files, and matched-route metadata
- `Quantum\Http\Response` for outbound status, headers, redirects, and body formatting

It also ships:

- `Quantum\Http\Helpers\http.php` global helpers such as `request()`, `response()`, `redirect()`, and `old()`
- `Quantum\Http\Enums\ContentType` and `Quantum\Http\Enums\StatusCode` constant sets
- `Quantum\Http\Exceptions\HttpException` for package-specific runtime failures

## Shared-instance model

Both `request()` and `response()` are DI-backed helpers.

On first use, each helper registers its class in the container and then returns `Di::get(...)`. Repeated helper calls therefore reuse one shared `Request` instance and one shared `Response` instance for the current container.

That matters because later mutations operate on the same objects:

- `request()->set(...)` changes the shared request payload
- `response()->json(...)` keeps building the same response object until it is flushed or replaced

## Request bootstrap model

`Request::__construct()` accepts an optional `Quantum\Environment\Server` instance. If none is passed, it resolves `server()` and immediately calls `populateFromServer()`.

`populateFromServer()` does four things in order:

1. copies method, protocol, host, port, URI, and query string from the server object
2. reads a normalized content type from the server object
3. loads request headers from `getallheaders()` and lowercases the keys
4. parses request parameters and files, including raw multipart bodies when needed

The final request parameter store is merged in this order:

1. filtered `$_GET`
2. filtered `$_POST`
3. JSON body payload for `PUT`, `PATCH`, or `POST` with `application/json`
4. URL-encoded raw body for `PUT`, `PATCH`, or `POST` with `application/x-www-form-urlencoded`
5. parsed multipart raw input parameters

Later sources overwrite earlier ones when keys collide.

## Response formatting model

`Response` keeps a status code, a header map, and an internal response array.

Body formatting is content-type-driven:

- `text/html` -> rendered view string
- `application/json` -> `json_encode($responseData)`
- `application/xml` -> array-to-XML conversion
- `application/javascript` -> JSONP callback wrapping

If the current `Content-Type` does not match one of those formatters, `getContent()` throws `HttpException`.

## Important package constraints

- `Request::METHODS` only allows `GET`, `POST`, `PUT`, `PATCH`, and `DELETE`.
- `Request::flush()` clears headers, payload, files, protocol, host, port, URI, and query, but it does not clear the matched route object.
- `Response::send()` emits headers and the formatted body directly; it does not return the content.
- `redirect()` only sets status and `Location`; it does not build a body automatically.
- `page_not_found_response()` treats the request as JSON only when the `Accept` header is exactly `application/json`.
