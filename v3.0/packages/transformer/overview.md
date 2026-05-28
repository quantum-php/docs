# Transformer

The Transformer package gives Quantum one small, explicit way to map a list of records into API-ready or view-ready output.

Use it when you already have an array of items and want to run the same formatting rule across every item through a dedicated transformer class.

## What the package provides

The package is intentionally tiny:

- `Quantum\Transformer\Transformer` exposes one static `transform()` method
- `Quantum\Transformer\Contracts\TransformerInterface` defines the transformer contract
- the global `transform()` helper forwards to the same static method

There is no factory, container integration, registry, or built-in single-item wrapper.

## Basic flow

```php
use Quantum\Transformer\Contracts\TransformerInterface;
use Quantum\Transformer\Transformer;

class UserTransformer implements TransformerInterface
{
    public function transform($item): array
    {
        return [
            'id' => $item->id,
            'name' => $item->name,
        ];
    }
}

$payload = Transformer::transform($users, new UserTransformer());
```

You can use the helper instead when you prefer a shorter call site:

```php
$payload = transform($users, new UserTransformer());
```

## When it fits well

This package is a good fit when:

- a service already returns an array of models, DTOs, or plain arrays
- you want presentation shaping to live outside the service or model
- you want one reusable transformation rule for collection output

## Important constraints

- Input must be an array. The package does not accept traversables, collections, or generators directly.
- The transformer object must implement `TransformerInterface`.
- The package only transforms arrays of items. If you need to transform one record, wrap it in an array or call your transformer directly.
- The package does not validate or normalize transformer output. Each `transform()` call may return any value.

