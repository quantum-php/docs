# Transformer Architecture

Transformer is intentionally minimal.

## Execution model

`transform()` is a direct map operation:

1. receive an input array
2. call `TransformerInterface::transform($item)` for each item
3. return the mapped array in the same order

There is no internal caching, registry, or DI lookup.

## State model

The package itself is stateless.

Any state comes from the transformer instance you pass in.

## Error model

Transformer does not catch exceptions thrown inside your transformer.

If item-level transformation can fail, handle that in your transformer implementation.
