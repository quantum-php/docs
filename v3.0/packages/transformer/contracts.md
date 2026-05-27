# Transformer Contracts

## Transformer interface

Every transformer implements `Quantum\Transformer\Contracts\TransformerInterface`.

```php
interface TransformerInterface
{
    public function transform($item);
}
```

The contract stays deliberately open:

- `$item` may be any value
- the return value may be any value

In most applications, transformers return arrays that are ready for JSON responses or view data.

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
- the same transformer instance handles the full collection
- the returned array keeps input order
- associative keys stay attached to their transformed values
- the callback receives each item value, without array keys

## Type boundaries

With `strict_types=1` and concrete parameter types, PHP enforces the package boundary at the method signature.

That means:

- pass an array as the first argument
- pass an object that implements `TransformerInterface` as the second argument

PHP raises `TypeError` when either argument falls outside that contract.

## Exception and return-value flow

The package forwards the result of each `transform()` call directly into the returned array.

Practical effect:

- exceptions from your transformer move upward unchanged
- mixed return types remain mixed in the final array

This keeps the package predictable and leaves output policy inside your transformer class.

## Stateless package contract

`Transformer::transform()` is static and carries no package-level cache or shared state.

Each call depends on:

- the array you pass in
- the transformer object you pass in
