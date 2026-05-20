# Http Response

## Purpose

`Quantum\Http\Response` is Quantum's mutable outbound response builder.

It tracks:

- HTTP status code
- response headers
- response payload data
- XML root template
- JSONP callback name

## Core write API

The general-purpose mutators are:

- `set($key, $value)`
- `delete($key)`
- `setHeader($key, $value)`
- `deleteHeader($key)`
- `setStatusCode($code)`

Each setter that affects status, headers, or body content returns `$this`, so response construction is chainable.

## Status handling

Status codes are validated against the package's internal status-text map.

`setStatusCode()` throws `InvalidArgumentException` for unknown codes.

`getText($code)` uses the same map and throws for unknown values too.

The package ships a broad `Quantum\Http\Enums\StatusCode` constant set covering 1xx through 5xx values, but only values present in the internal map are accepted at runtime.

Default status is `200 OK`.

## Header handling

Headers are stored exactly under the keys you provide.

Unlike request headers, response headers are not normalized to lowercase.

That means `hasHeader('Content-Type')` and `hasHeader('content-type')` are different lookups unless you reuse the same key casing.

### Content type helpers

`setContentType($contentType)` is a convenience wrapper around `setHeader('Content-Type', ...)`.

`getContentType()` falls back to `text/html` when no `Content-Type` header has been set.

### Redirects

`redirect($url, $code = 302)` only does two things:

- sets the status code
- sets the `Location` header

It does not clear existing body data and does not force a content type.

## Body formats

The response body is stored as an internal array and later formatted based on the current content type.

### HTML

`html($html, $code = null)`:

- sets content type to `text/html`
- optionally sets the status code
- stores the HTML string under `ReservedKeys::RENDERED_VIEW`

`formatHtml()` then returns only that stored rendered-view value.

Any other body keys remain in the response array but are ignored by HTML rendering.

### JSON

`json($data = null, $code = null)`:

- sets content type to `application/json`
- optionally sets the status code
- merges the provided array into the existing response array

`formatJson()` uses `json_encode($this->all(), JSON_UNESCAPED_UNICODE)`.

Notable behavior:

- JSON calls append/overwrite keys instead of replacing the whole payload
- encoding failures collapse to an empty string because of `?: ''`

### JSONP

`jsonp($callback, $data = null, $code = null)` behaves like `json()` but also stores the callback function name and sets content type to `application/javascript`.

`formatJsonp()` returns:

```php
<callback>(<json>)
```

The callback name is used as provided. The package does not validate or sanitize it.

### XML

`xml($data = null, $root = '<data></data>', $code = null)`:

- sets content type to `application/xml`
- optionally sets the status code
- stores the provided root element template
- merges provided data into the existing response array

`formatXml()` converts the internal response array into XML through `SimpleXMLElement` and `DOMDocument`.

Important XML details:

- numeric keys are renamed to `item0`, `item1`, and so on
- keys containing `@` are split into a tag name plus JSON-decoded attributes
- scalar values are escaped with `htmlspecialchars()`
- nested arrays become nested XML elements

If `SimpleXMLElement::asXML()` fails, the formatter returns an empty string.

## Content resolution

`getContent()` selects a formatter from a fixed map:

- `text/html` -> `formatHtml`
- `application/xml` -> `formatXml`
- `application/json` -> `formatJson`
- `application/javascript` -> `formatJsonp`

Any other content type raises `HttpException("Unsupported content type: ...")`.

## Sending the response

`send()` performs real output side effects.

When the environment is not in testing mode, it clears every active output buffer first:

```php
while (ob_get_level() > 0) {
    ob_end_clean();
}
```

It then:

1. emits each stored header with `header("$key: $value")`
2. sets the HTTP status with `http_response_code(...)`
3. echoes the formatted content

`send()` does not terminate the PHP process by itself.

## Flush behavior

`flush()` resets the response object back to a clean baseline:

- status -> `200 OK`
- headers -> empty array
- payload -> empty array
- XML root -> `<data></data>`
- JSONP callback -> empty string

Because `response()` is DI-backed, `flush()` is the package-level way to reuse the shared response instance safely in the same process.
