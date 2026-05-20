# Di Architecture

The Di package separates bindings, runtime instances, and the public API into three layers.

## Components

### `Di`

`Quantum\Di\Di` is a thin facade. It looks up the current `DiContainer` from `App::getContext()` and forwards the static call.

It does not store registrations or instances itself.

### `DiRegistry`

`DiRegistry` owns the binding map:

```php
private array $dependencies = [];
```

Each key is an abstract name and each value is a concrete class name.

The registry is responsible for validation during registration:

- concrete class must exist
- concrete class must be instantiable
- abstract key, when provided, must be an existing class or interface
- abstract key cannot be registered twice

### `DiContainer`

`DiContainer` owns two runtime maps:

```php
private array $container = [];
private array $resolving = [];
```

- `$container` stores shared object instances keyed by abstract name.
- `$resolving` tracks the current dependency chain to detect circular references.

## Resolution pipeline

### 1. Binding lookup

`get()` and `create()` both end up in `resolve()`.

`resolve()` asks the registry for the concrete class behind the abstract key.

### 2. Circular dependency guard

Before instantiating anything, `resolve()` calls `checkCircularDependency()`.

If the same abstract is already in `$resolving`, the package builds a readable chain string from the current keys and throws `DiException::circularDependency(...)`.

### 3. Reflection-based construction

`instantiate()` creates a `ReflectionClass`, reads the constructor, resolves constructor parameters, and finally returns:

```php
new $concrete(...$params)
```

If the class has no constructor, it is instantiated with no arguments.

### 4. Shared vs fresh return path

`resolve()` behaves differently depending on the `$singleton` flag:

- `get()` calls `resolve(..., true)` and caches the created object in `$container`
- `create()` calls `resolve(..., false)` and skips container caching

The same binding can therefore produce either a shared instance or a fresh instance depending on which API you call.

## Parameter resolver rules

`resolveParameters()` loops over reflected parameters and delegates each one to `resolveParameter()`.

`resolveParameter()` prefers container-managed class dependencies first and manual arguments later.

That means a registered class type wins even if you also supplied a manual value in `$args`.

### Array parameters are special

When the parameter type is exactly `array`, the resolver returns the entire remaining `$args` array instead of shifting one element.

So this callable:

```php
function handle(array $payload)
```

receives every remaining manual argument as the payload array.

### Primitive fallback is loose

When a parameter is not a registered class and not an instantiable class, the resolver falls back to positional arguments, then defaults, then `null`.

The container itself does not validate whether that `null` is acceptable for the target signature.

## Callable autowiring model

`autowire()` reflects only two callable shapes:

- `Closure`
- array callables

String callables and invokable objects are rejected by the current implementation, even though PHP itself supports them as `callable` values.

## Lifecycle boundaries

The package is container-scoped, not process-global by itself.

What feels global in application code comes from the `Di` facade reading the current app context. The real lifecycle is the lifecycle of the `DiContainer` instance attached to that context.

## Exception surface

The package raises `DiException` for its own validation failures:

- dependency not registered
- dependency already registered
- dependency not instantiable
- invalid abstract dependency
- circular dependency
- invalid callable

Reflection and PHP type errors are not wrapped universally. Some failures can still surface as native reflection or runtime errors during construction.