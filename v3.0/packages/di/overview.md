# Di

The Di package is Quantum's runtime dependency injection container. It keeps class bindings in a registry, resolves constructor dependencies with reflection, and optionally caches shared instances for the current app context.

The package is built from three classes:

- `Quantum\Di\Di` is the static facade.
- `Quantum\Di\DiContainer` performs registration, resolution, and instance caching.
- `Quantum\Di\DiRegistry` stores validated abstract-to-concrete bindings.

## Entry points

### `Di` facade

`Quantum\Di\Di` does not keep its own global container. Every static call is forwarded to the container returned by `App::getContext()->getContainer()`.

That means the static API is only a facade over the current app context. If the app context swaps containers, later `Di::...` calls will use the new container.

### `DiContainer`

`DiContainer` is the real runtime object. It exposes the package API:

- `registerDependencies()`
- `register()`
- `isRegistered()`
- `has()`
- `set()`
- `get()`
- `create()`
- `autowire()`
- `reset()`
- `resetContainer()`

## Registration model

### `register(string $concrete, ?string $abstract = null)`

`register()` stores a binding in `DiRegistry`.

- With only `$concrete`, the class is registered against itself.
- With both arguments, the abstract key points to the concrete class.
- The concrete class must exist and be instantiable.
- When an abstract key is provided, it must be an existing class or interface.
- Re-registering the same abstract key throws `DiException::dependencyAlreadyRegistered(...)`.

### `registerDependencies(array $dependencies)`

`registerDependencies()` iterates the input map and only registers keys that are not already present. Existing bindings are skipped instead of replaced.

## Resolution model

### Shared instances: `get()`

`get()` requires the dependency to be registered first. It then resolves the binding and caches the created object under the abstract key.

Repeated `get()` calls for the same abstract return the same instance for that container.

### Fresh instances: `create()`

`create()` always returns a newly instantiated object.

If the dependency is not registered yet, `create()` first registers it against itself and then resolves it without caching the result in the container.

### Manual instances: `set()`

`set()` inserts an already-built object into the container.

Important rules from the current implementation:

- The abstract must be an existing class or interface.
- The instance must satisfy `is_a($instance, $abstract)`.
- If the container already has an instance for that abstract, `set()` always throws, regardless of the `$override` flag.
- If the abstract is not registered yet, `set()` auto-registers the instance class against that abstract.
- `$override = false` only blocks inserting an instance when a registry binding already exists.
- With the default `$override = true`, `set()` may add a container instance even when a registry binding already points somewhere else.

## Autowiring behavior

`autowire()` resolves parameters for a callable and returns the argument list. It does not invoke the callable.

Supported callable forms are limited to:

- closures
- array callables such as `[$object, 'method']` or `[ClassName::class, 'method']`

Anything else throws `DiException::invalidCallable(...)`.

Parameter resolution follows this order:

1. If the parameter type is registered, return `get($type)`.
2. Otherwise, if the type names an instantiable class, return `create($type)`.
3. If the parameter type is `array`, return the entire remaining `$args` array.
4. If manual `$args` still contain values, shift and return the next one.
5. Otherwise return the parameter default value when available.
6. Otherwise return `null`.

This has a few practical consequences:

- registered class dependencies are shared
- unregistered instantiable class dependencies are created fresh
- scalar parameters are positional only
- missing required scalar parameters become `null`, which can still fail later when PHP enforces the callable or constructor signature

## Circular dependency protection

During `get()` and `create()`, the container tracks the abstract keys it is currently resolving.

If resolution re-enters an abstract that is already in progress, the package throws `DiException::circularDependency(...)` with a chain such as:

```text
FooInterface -> BarService -> FooInterface
```

## Reset behavior

- `resetContainer()` clears cached instances and the in-progress resolution map.
- `reset()` clears both the registry bindings and the cached instances.

Use `reset()` only when you want a fully empty container state.

## Important constraints

- The package only resolves constructor injection; there is no factory binding API in this package.
- `has()` checks cached instances only. It does not tell you whether a dependency is registered.
- `isRegistered()` checks registry bindings only. It does not tell you whether an instance has been created.
- `Di::__callStatic()` throws `DiException::invalidCallable($method)` when the current container does not implement the requested method.