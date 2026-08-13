# HttpClient Usage

Start by choosing whether you need one request or many.

## Send a single request

```php
$client = httpRequest('https://api.example.com/users')
    ->setMethod('GET')
    ->setHeader('Accept', 'application/json')
    ->start();

$body = $client->getResponseBody();
$headers = $client->getResponseHeaders();
$status = $client->info(CURLINFO_RESPONSE_CODE);
```

Because response headers are normalized to lowercase, read them like this:

```php
$contentType = $client->getResponseHeaders('content-type');
```

## Send JSON or form data in a single request

```php
$client = httpRequest('https://api.example.com/users')
    ->setMethod('POST')
    ->setHeader('Content-Type', 'application/json')
    ->setData(['name' => 'Arman', 'role' => 'admin'])
    ->start();
```

`setData()` is passed through the native adapter's post-data builder before the request is executed.

## Check transport errors

```php
$errors = $client->getErrors();

if (!empty($errors)) {
    $code = $errors['code'];
    $message = $errors['message'];
}
```

The package records transport-layer curl errors. It does not treat HTTP 4xx or 5xx responses as package exceptions by itself.

## Queue multiple requests

```php
$client = httpMultiRequest();

$client->addGet('https://api.example.com/users');
$client->addGet('https://api.example.com/teams');
$client->start();

$responses = $client->getResponse();
$errors = $client->getErrors();
```

In multi mode, `$responses` is keyed by curl request ID. Inspect each entry's `headers`, `cookies`, and `body` sections.

## Use async callbacks for multi requests

```php
use Quantum\HttpClient\Contracts\CurlAdapterInterface;

$client = httpAsyncMultiRequest(
    function (CurlAdapterInterface $request) {
        $body = $request->getResponse();
    },
    function (CurlAdapterInterface $request) {
        $error = $request->getErrorMessage();
    }
);

$client->addGet('https://api.example.com/users');
$client->start();
```

In this mode, handle each result inside your callbacks when you need per-request side effects. `getResponse()` and `getErrors()` are also populated after `start()` finishes.

## Recommended usage patterns

- use single-request mode when you need response inspection helpers like `info()` or `getResponseBody()`
- use normal multi-request mode when you want Quantum to collect finished responses for later inspection
- use async multi-request mode when callback handling is needed during batch execution
- set headers through `setHeader()` or `setHeaders()` if you want `getRequestHeaders()` to reflect them later
- prefer a fresh `HttpClient` instance for each independent request or batch

## Caveats

- call `createRequest()` or one of the multi-request builders before any adapter passthrough method
- `setMethod()` only affects the single-request execution path
- `setData()` is skipped when the value is empty or otherwise falsey
- recreating the underlying request does not clear earlier wrapper state; if you reuse one instance, reset or overwrite method, data, and headers deliberately
- multi-request response and error collections stay on the wrapper object until you discard that instance
- single-request getters throw for multi clients instead of choosing one request implicitly
