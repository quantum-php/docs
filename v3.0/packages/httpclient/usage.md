# HttpClient Usage

Start by choosing whether you need one request or many.

## Send a single request

```php
use Quantum\HttpClient\HttpClient;

$client = (new HttpClient())
    ->createRequest('https://api.example.com/users')
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
$client = (new HttpClient())
    ->createRequest('https://api.example.com/users')
    ->setMethod('POST')
    ->setHeader('Content-Type', 'application/json')
    ->setData(['name' => 'Arman', 'role' => 'admin'])
    ->start();
```

`setData()` is passed through curl-class `buildPostData(...)` before the request is executed.

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
use Quantum\HttpClient\HttpClient;

$client = (new HttpClient())->createMultiRequest();

$client->addGet('https://api.example.com/users');
$client->addGet('https://api.example.com/teams');
$client->start();

$responses = $client->getResponse();
$errors = $client->getErrors();
```

In multi mode, `$responses` is keyed by curl request ID. Inspect each entry's `headers`, `cookies`, and `body` sections.

## Use async callbacks for multi requests

```php
use Curl\Curl;
use Quantum\HttpClient\HttpClient;

$client = (new HttpClient())->createAsyncMultiRequest(
    function (Curl $request) {
        $body = $request->getResponse();
    },
    function (Curl $request) {
        $error = $request->getErrorMessage();
    }
);

$client->addGet('https://api.example.com/users');
$client->start();
```

In this mode, handle the result inside your callbacks. Do not rely on `getResponse()` or `getErrors()` being populated afterward.

## Recommended usage patterns

- use single-request mode when you need response inspection helpers like `info()` or `getResponseBody()`
- use normal multi-request mode when you want Quantum to collect finished responses for later inspection
- use async multi-request mode only when callback handling is the real output path
- set headers through `setHeader()` or `setHeaders()` if you want `getRequestHeaders()` to reflect them later

## Caveats

- call `createRequest()` or one of the multi-request builders before any proxied curl-class method
- `setMethod()` only affects the single-request execution path
- `setData()` is skipped when the value is empty or otherwise falsey
- single-request getters throw for multi clients instead of choosing one request implicitly
