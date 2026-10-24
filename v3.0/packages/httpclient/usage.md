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

A JSON or XML response body arrives already decoded; see the [response model](overview.md#response-model).

## Send JSON or form data in a single request

```php
$client = httpRequest('https://api.example.com/users')
    ->setMethod('POST')
    ->setHeader('Content-Type', 'application/json')
    ->setData(['name' => 'Arman', 'role' => 'admin'])
    ->start();
```

How `setData()` is sent depends on the `Content-Type` header you set before `start()`:

- an array (or a `JsonSerializable`) with an `application/json` or `application/...+json` header is sent as a JSON body
- an array without a JSON header is form-encoded, like `name=Arman&role=admin`
- an array with a `multipart/form-data` header, or one that holds a `CURLFile`, is sent as multipart, which is how you upload a file
- a string is sent as it is

```php
$client = httpRequest('https://api.example.com/avatar')
    ->setMethod('POST')
    ->setData(['user' => 'arman', 'avatar' => new CURLFile('/path/to/avatar.png')])
    ->start();
```

## Check errors

```php
$errors = $client->getErrors();

if (!empty($errors)) {
    $code = $errors['code'];
    $message = $errors['message'];
}
```

`getErrors()` is empty when the request worked. It holds an entry when cURL failed to complete the request, and also when the server answered with an HTTP 4xx or 5xx status. A request to a missing page gives:

```php
['code' => 404, 'message' => 'HTTP/1.1 404 Not Found']
```

For a cURL failure, `code` is the cURL error number and `message` is its description. Neither case throws an exception. The response body of a 4xx or 5xx answer is still available through `getResponseBody()`.

## Queue multiple requests

```php
$client = httpMultiRequest();

$client->addGet('https://api.example.com/users', ['page' => 2]);
$client->addGet('https://api.example.com/teams');
$client->addPost('https://api.example.com/teams', ['name' => 'Core']);
$client->start();

$responses = $client->getResponse();
$errors = $client->getErrors();
```

`addGet()` appends its data array to the URL as a query string, with `&` when the URL already has one, so the first request above asks for `/users?page=2`. `addPost()` builds its body the same way as `setData()`.

In multi mode, `$responses` is keyed by curl request ID. Inspect each entry's `headers`, `cookies`, and `body` sections. `$errors` is keyed the same way and holds only the requests that failed.

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

In this mode, handle each result inside your callbacks when you need per-request side effects. A request that failed, including one that got an HTTP 4xx or 5xx answer, goes to the error callback; every other request goes to the success callback. `getResponse()` and `getErrors()` are also populated after `start()` finishes.

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
