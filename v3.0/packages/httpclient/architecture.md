# HttpClient Architecture

The package wraps Quantum-owned native cURL adapters behind the same `HttpClient` API.

## Runtime flow

### 1. Create a client

You begin in one of three ways:

- `createRequest($url)` for one request
- `createMultiRequest()` for a collected batch
- `createAsyncMultiRequest($success, $error)` for callback-driven batches

Each method replaces the current internal adapter instance.

It does **not** reset the wrapper's other state. The current HTTP method, pending data payload, tracked request headers, collected responses, and collected errors all stay on the same `HttpClient` object until you overwrite them or create a fresh wrapper instance.

## 2. Configure the underlying adapter

`HttpClient` exposes a small native API (`setMethod()`, `setData()`, `start()`) and forwards supported adapter methods through `__call()`.

Supported passthrough methods include:

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

For a normal multi request, `start()` calls the native `MultiCurlAdapter`. Each completed request is passed into `handleResponse()` by the callback registered in `createMultiRequest()`.

### Async multi request path

For async multi requests, Quantum installs the same completion collector used by normal multi requests and also wires your success and error callbacks. Your callbacks are useful for per-request side effects, while `getResponse()` and `getErrors()` remain available after `start()` finishes.

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

If the current adapter is a multi-request adapter, these methods fail instead of guessing which request you meant:

- `getRequestHeaders()`
- `getResponseHeaders()`
- `getResponseCookies()`
- `getResponseBody()`
- `info()`
- `url()`

That contract keeps the single-request API predictable, but it means multi-request consumers must work with the aggregated response arrays instead.
