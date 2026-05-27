# Request Handling

The Quantum PHP Framework provides comprehensive methods for interacting with request parameters, files, and payload data.

## Input Merge Precedence

When a request is initialized, the `Request` object aggregates parameters from various sources. The final parameters are merged in the following order of precedence (each source overwrites the previous one):

1. **Query Parameters**: Parameters from the request URI query string.
2. **POST Parameters**: Standard `$_POST` data.
3. **JSON Payload**: Parsed contents of the request body if the content type is JSON.
4. **URL-Encoded Body**: Parsed contents of the request body if the content type is `application/x-www-form-urlencoded`.
5. **Multipart Raw Inputs**: Parsed parameters for requests with `multipart/form-data`.

## Multipart Raw Parsing

The framework supports raw parsing for `multipart/form-data` requests.

- **Parser Gate**: The multipart raw parser is triggered for `PUT`, `PATCH`, and `POST` requests where the `Content-Type` header explicitly identifies `multipart/form-data`.
- **Precedence**: These parameters are merged last, giving them the highest precedence over values defined in other sources.

## Uploaded Files

Uploaded files are handled through the `setUploadedFiles` method, which follows this merge baseline:

1. **`$_FILES` Normalization**: PHP's native `$_FILES` global is processed via the `handleFiles()` method, which iterates over all top-level keys in `$_FILES` and normalizes both single and multi-file payloads.
2. **Multipart Raw Files**: Files extracted during raw multipart parsing are merged into the collection if present.
3. **Resulting Collection**: The finalized files collection contains the normalized keys from `$_FILES` merged with any files extracted by the raw multipart parser. 

See the [Advanced Request Lifecycle](../advanced-features/request-lifecycle.md) for further technical details on the parsing contract.

## Query Accessors

The `Query` trait provides the mechanism for reading and modifying the raw query string associated with the current request.

### `getQueryParam(string $key): ?string`

This method returns the **first-match raw value** for the specified key from the current request's query string.

- **Note on decoding**: It returns the raw value exactly as it appears in the query string; it **does not URL decode** the value.
- **Return value**: Returns the raw value if found, or `null` if the key is not present in the query string or if the query string is unset.

**Examples:**

```php
// Assuming current query string: "id=123&name=John%20Doe"

$request->getQueryParam('id');   // Returns "123"
$request->getQueryParam('name'); // Returns "John%20Doe"
$request->getQueryParam('age');  // Returns null
```

### `setQueryParam(string $key, string $value): void`

This method appends a new query parameter to the query string.

- **Non-overwriting**: It does not overwrite existing keys. If a key already exists, appending will result in duplicate keys in the raw query string.
- **Encoding contract**: The framework **does not URL-encode** the key or value. Callers are responsible for encoding values if they contain spaces or special characters.

**Example:**

```php
// Initial state: query string is null

$request->setQueryParam('user', 'arman');
// Query string: "user=arman"

// Appending with special characters (no automatic encoding)
$request->setQueryParam('message', 'hello world'); 
// Raw query string: "user=arman&message=hello world"

// Appending an existing key (duplicate keys)
$request->setQueryParam('id', '1');
$request->setQueryParam('id', '2');
// Raw query string: "user=arman&message=hello world&id=1&id=2"
```

## What to read next

After request handling, continue with:

- [Routing](routing.md)
- [Middleware](middleware.md)
- [Request Lifecycle](../advanced-features/request-lifecycle.md)
