# Transformer Contracts

## Transformer interface

Every transformer must implement `Quantum\Transformer\Contracts\TransformerInterface`.

```php
interface TransformerInterface
{
    public function transform($item);
}
```

The contract is deliberately loose:

- `$item` can be any value
- the return value can be any value

In practice, most application transformers return arrays that are ready for JSON or templating.

## Collection transform contract

`Quantum\Transformer\Transformer::transform()` accepts:

- `array $data`
- `TransformerInterface $transformer`

and returns a transformed array.

```php
$result = Transformer::transform($data, $transformer);
```

Behavior that matters in real usage:

- the transformer runs once for each input item
- the returned array contains the per-item return values
- item order follows the input array order
- when you pass one array, PHP preserves associative keys during the mapping

## Type boundaries

Because the package declares `strict_types=1` and concrete parameter types:

- passing a non-array first argument fails with `TypeError`
- passing an object that does not implement `TransformerInterface` fails with `TypeError`

The package does not add its own exception layer around those cases.

## Failure behavior inside your transformer

The package does not catch exceptions or rewrite return values.

Practical effect:

- if your `transform()` method throws, that exception bubbles up unchanged
- if your `transform()` method returns mixed value types, the result array will contain those mixed values as-is

## Stateless package contract

`Transformer::transform()` is static and has no internal cache or shared state.

Each call depends only on:

- the array you pass in
- the transformer object you pass in
