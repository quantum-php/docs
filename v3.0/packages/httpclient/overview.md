# HttpClient

The HttpClient package gives Quantum a thin wrapper around `php-curl-class/php-curl-class` for outbound HTTP calls.

Use it when you want to:

- send one HTTP request and inspect its response body, headers, cookies, or cURL info
- batch multiple requests through `MultiCurl`
- keep request setup in Quantum code without talking to raw cURL resources

This package is intentionally small. It does not add retries, middleware, authentication helpers, or response object mapping. You work directly with one `HttpClient` instance and the underlying curl-class methods it proxies.

## Package shape

The package is built from three pieces:

- `Quantum\HttpClient\HttpClient` is the runtime wrapper
- `Quantum\HttpClient\Exceptions\HttpClientException` reports package-specific misuse such as starting before creating a request
- `Quantum\HttpClient\Enums\ExceptionMessages` defines local message constants

## Request modes

The package supports three modes.

### Single request

`createRequest($url)` creates a `Curl\Curl` client, stores the URL, and lets you configure the request through `HttpClient` methods plus proxied curl-class methods.

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

`createMultiRequest()` creates a `Curl\MultiCurl` client and registers a completion callback that collects each finished response into the package's internal response store.

Use this when you want to queue several requests and read the aggregated responses after `start()` finishes.

### Async multi request

`createAsyncMultiRequest($success, $error)` also creates `MultiCurl`, but instead of Quantum's completion collector it wires your own success and error callbacks.

Use this only when your application wants to handle each result inside those callbacks.

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

- You must call one of the `create...Request()` methods before calling `start()` or any proxied curl-class method.
- Single-request inspection methods are not available for `MultiCurl` clients.
- `setData()` only affects the single-request `start()` path.
- `createAsyncMultiRequest()` does not populate Quantum's internal response and error stores for you.
- Request headers are only mirrored into `getRequestHeaders()` when you set them through proxied `setHeader()` or `setHeaders()` calls.
- Reusing one `HttpClient` instance across multiple requests keeps prior wrapper state unless you overwrite it. That includes the current method, pending data, tracked request headers, and collected response/error arrays.
- The package only validates methods set through `setMethod()`. If you call underlying curl-class helpers directly, their behavior comes from that library.
