# Transformer Architecture

Transformer is intentionally minimal.

## Execution model

`transform()` performs a direct collection map:

1. receive an input array
2. call `TransformerInterface::transform($item)` for each item value
3. return the mapped array with the same ordering and keys

That makes the package easy to reason about in response and view pipelines.

## State model

The package itself is stateless.

Any shared context comes from the transformer instance you pass in, and that same object is used for the full mapping call.

## Error model

Transformer leaves exception handling with your transformer implementation.

That is a good fit when your application already has its own response, logging, or validation flow around collection shaping.
