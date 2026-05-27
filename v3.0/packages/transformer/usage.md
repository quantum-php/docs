# Transformer Usage

## Transform a result list

The common flow is to fetch records in a service and map them through a transformer.

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

## Reuse one transformer instance across a collection

```php
$transformer = new PostTransformer();

$list = transform($posts, $transformer);
$featured = transform($featuredPosts, $transformer);
```

The package passes the same transformer object through the full collection mapping. That fits stateless transformers well and also works for transformers that carry shared formatting context.

## Choose the right path for one record

The package focuses on collection mapping. For one record, call the transformer directly when that reads better in your code.

```php
$item = $posts[0];
$payload = (new PostTransformer())->transform($item);
```

If you want to keep the same collection-shaped flow, wrap the item and read the first transformed value.

```php
$payload = transform([$item], new PostTransformer())[0];
```

## Preserve or reindex keys intentionally

`transform()` uses PHP array mapping semantics, so associative keys stay attached to their transformed values.

```php
$byUuid = [
    'a1' => $postA,
    'b2' => $postB,
];

$transformed = transform($byUuid, new PostTransformer());
// keys remain: a1, b2
```

If you want sequential numeric keys, normalize the input first.

```php
$transformed = transform(array_values($byUuid), new PostTransformer());
```

## Convert iterables before mapping

The package works with arrays. When your data source returns another iterable type, convert it before calling the helper.

```php
$payload = transform(iterator_to_array($items), new PostTransformer());
```

## Keep output shape predictable

The interface accepts any return value, so the clearest application code comes from returning one consistent structure for each item in the same collection.

## Empty collections flow through cleanly

An empty input array returns an empty array, which makes the helper a good fit for response pipelines that already expect a collection result.
