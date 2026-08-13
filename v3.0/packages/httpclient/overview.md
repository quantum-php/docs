# HttpClient

The HttpClient package gives Quantum a small native cURL wrapper for outbound HTTP calls.

Use it when you want to:

- send one HTTP request and inspect its response body, headers, cookies, or cURL info
- batch multiple requests through native multi-cURL
- keep request setup in Quantum code without talking to raw cURL resources

This package is intentionally small. It does not add retries, middleware, authentication helpers, or response object mapping. You work with one `HttpClient` facade backed by Quantum-owned cURL adapters.

## Package shape

The package is built from three pieces:

- `Quantum\HttpClient\HttpClient` is the runtime wrapper
- `Quantum\HttpClient\Factories\HttpClientFactory` creates fresh request facades
- `httpRequest()`, `httpMultiRequest()`, and `httpAsyncMultiRequest()` are helper shortcuts
- `Quantum\HttpClient\Exceptions\HttpClientException` reports package-specific misuse such as starting before creating a request
- `Quantum\HttpClient\Enums\ExceptionMessages` defines local message constants

## Request modes

The package supports three modes.

### Single request

`createRequest($url)` creates a native `CurlAdapter`, stores the URL, and lets you configure the request through `HttpClient` methods plus supported adapter passthrough methods.

This is the only mode that supports:

- `setMethod()`
- `setData()`
- `getRequestHeaders()`
- `getResponseHeaders()`
- `getResponseCookies()`
- `getResponseBody()`
- `info()`
- `url()`

### Multi request

`createMultiRequest()` creates a native `MultiCurlAdapter` and registers a completion callback that collects each finished response into the package's internal response store.

Use this when you want to queue several requests and read the aggregated responses after `start()` finishes.

### Async multi request

`createAsyncMultiRequest($success, $error)` creates a native `MultiCurlAdapter`, wires your success and error callbacks, and also keeps Quantum's internal response and error stores populated.

Use this when your application wants callback handling while still allowing later inspection through `getResponse()` and `getErrors()`.

## Supported single-request methods

`setMethod()` only accepts these values:

- `GET`
- `POST`
- `PUT`
- `PATCH`
- `DELETE`

Any other method triggers `HttpClientException::requestMethodNotAvailable(...)`.

## Response model

Responses are stored in three sections:

- `headers`
- `cookies`
- `body`

Headers are normalized to lowercase before storage, so `Content-Type` becomes `content-type` when you read it back.

For a single request, `getResponse()` returns one response array.

For multi requests, `getResponse()` returns a map keyed by curl request ID.

## Important constraints

- You must call one of the `create...Request()` methods before calling `start()` or any adapter passthrough method.
- Single-request inspection methods are not available for multi-request adapters.
- `setData()` only affects the single-request `start()` path.
- Request headers are only mirrored into `getRequestHeaders()` when you set them through proxied `setHeader()` or `setHeaders()` calls.
- Reusing one `HttpClient` instance across multiple requests keeps prior wrapper state unless you overwrite it. That includes the current method, pending data, tracked request headers, and collected response/error arrays.
- Adapter passthrough is intentionally limited to supported adapter methods such as `setHeader()`, `setHeaders()`, `setOpt()`, `setOpts()`, `addGet()`, and `addPost()`.
