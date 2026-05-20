# HttpClient Architecture

The package wraps either `Curl\Curl` or `Curl\MultiCurl` behind the same `HttpClient` API.

## Runtime flow

### 1. Create a client

You begin in one of three ways:

- `createRequest($url)` for one request
- `createMultiRequest()` for a collected batch
- `createAsyncMultiRequest($success, $error)` for callback-driven batches

Each method replaces the current internal client instance.

## 2. Configure the underlying curl client

`HttpClient` exposes a small native API (`setMethod()`, `setData()`, `start()`) and forwards unknown method calls to the underlying curl-class object through `__call()`.

That means methods such as these come from the wrapped library, not from Quantum itself:

- `setHeader()`
- `setHeaders()`
- `setOpt()`
- `addGet()`
- `addPost()`

If the wrapped client does not have the requested method, `__call()` throws `HttpClientException::methodNotSupported(...)`.

## 3. Start execution

### Single request path

For a single request, `start()` calls an internal `startSingleRequest()` method that:

1. applies `CURLOPT_CUSTOMREQUEST` from `setMethod()`
2. applies `CURLOPT_POSTFIELDS` when `setData()` holds a truthy value
3. executes the request
4. stores headers, cookies, body, and any transport error

### Multi request path

For a normal multi request, `start()` simply calls `MultiCurl::start()`. Each completed request is then passed into `handleResponse()` by the callback registered in `createMultiRequest()`.

### Async multi request path

For async multi requests, Quantum does not install its own completion collector. Your success and error callbacks are the primary output path.

## Response storage model

Quantum stores completed data in two internal arrays:

- `$response[$curlId]`
- `$errors[$curlId]`

Each response entry contains:

- `headers`
- `cookies`
- `body`

Each error entry contains:

- `code`
- `message`

On single requests, public getters collapse the storage down to the current request ID.

On multi requests, public getters return the full ID-keyed maps.

## Header tracking model

The package keeps a separate `$requestHeaders` array for headers you set through proxied:

- `setHeader($name, $value)`
- `setHeaders([...])`

Those keys are lowercased before storage.

This is only a bookkeeping layer for later reads through `getRequestHeaders()`. It does not inspect headers set through unrelated low-level cURL options.

## Guard rails

Several read methods call `ensureSingleRequest()` first.

If the current client is `MultiCurl`, these methods fail instead of guessing which request you meant:

- `getRequestHeaders()`
- `getResponseHeaders()`
- `getResponseCookies()`
- `getResponseBody()`
- `info()`
- `url()`

That contract keeps the single-request API predictable, but it means multi-request consumers must work with the aggregated response arrays instead.
