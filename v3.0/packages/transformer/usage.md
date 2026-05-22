# Transformer Usage

## Transform a result list

The most common pattern is to fetch records in a service and map them through a transformer.

```php
use Quantum\Transformer\Contracts\TransformerInterface;

class PostTransformer implements TransformerInterface
{
    public function transform($item): array
    {
        return [
            'uuid' => $item->uuid,
            'title' => $item->title,
            'updated_at' => $item->updated_at,
        ];
    }
}

$payload = transform($posts, new PostTransformer());
```

This keeps response shaping separate from query or domain logic.

## Reuse one transformer instance

```php
$transformer = new PostTransformer();

$list = transform($posts, $transformer);
$featured = transform($featuredPosts, $transformer);
```

This works well when the transformer itself is stateless.

If your transformer stores mutable state, remember that the package will reuse the same object for every item in that call.

## Transform a single item

The package does not expose a dedicated single-record method.

Use one of these approaches:

```php
$item = $posts[0];
$payload = (new PostTransformer())->transform($item);
```

or:

```php
$payload = transform([$item], new PostTransformer())[0];
```

Calling the transformer directly is usually clearer for one record.

## Common pitfalls

### Pass a real array

The package signature only accepts arrays.

If you have another iterable type, convert it before calling the helper.

```php
$payload = transform(iterator_to_array($items), new PostTransformer());
```

### Keep transformer output predictable

The interface allows any return type, but mixed result shapes make downstream code harder to use.

Prefer returning one consistent structure for every item in the same collection.

### Handle failures in your own transformer

If a transform step can fail, catch or normalize that case inside your transformer.

The package itself does not provide fallback behavior per item.
