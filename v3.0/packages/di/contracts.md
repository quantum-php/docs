# Di Contracts

This page summarizes the runtime contracts exposed by the Di package.

## Registration contracts

### Concrete classes must be instantiable

`DiRegistry::register()` rejects a concrete class when either of these is true:

- the class does not exist
- the class exists but `ReflectionClass::isInstantiable()` returns `false`

That means interfaces, abstract classes, and traits cannot be used as concrete targets.

### Abstract keys must be real class-like names

When you register or set an abstract key explicitly, that key must already exist as a class or interface.

The package does not support arbitrary string service identifiers.

### Duplicate registrations are not replaced

A registry key can only be registered once. Re-registering the same abstract throws `DiException::dependencyAlreadyRegistered(...)`.

`registerDependencies()` is slightly softer: it silently skips keys that already exist.

## Instance contracts

### `has()` and `isRegistered()` mean different things

- `isRegistered($abstract)` checks whether a binding exists in `DiRegistry`
- `has($abstract)` checks whether a shared instance already exists in `DiContainer::$container`

A dependency can be registered without being instantiated, and an instance can exist only after resolution or `set()`.

### `set()` validates type compatibility

`set($abstract, $instance)` requires the instance to satisfy the abstract via `is_a($instance, $abstract)`.

If not, it throws `DiException::invalidAbstractDependency(...)`.

### `set()` does not overwrite existing instances

If the container already holds an instance for the abstract key, `set()` throws `DiException::dependencyAlreadyRegistered(...)`.

The `$override` parameter does not change this part of the behavior.

### `$override` only affects registry collisions

When `$override` is `false`, `set()` also refuses to insert an instance if the abstract already has a registry binding.

When `$override` is `true`, that registry collision check is skipped.
This does not rewrite the stored binding in `DiRegistry`; it only seeds the runtime container with the supplied object. If you later call `resetContainer()`, that seeded instance is removed and the container falls back to the original registered concrete.

## Resolution contracts

### `get()` requires prior registration

`get()` throws `DiException::dependencyNotRegistered(...)` when the abstract is unknown to the registry.

Unlike `create()`, it does not auto-register the class.

### `create()` self-registers missing classes

`create()` calls `register($dependency)` when the dependency is not already registered.

That means plain instantiable classes can be created without an explicit boot-time registration step.
It also means the binding stays in the registry after the fresh instance is returned, so a later `get($dependency)` call can reuse that self-registration and start returning a shared instance for the same class key.

### Shared caching is keyed by abstract name

When `get()` resolves `FooInterface::class` to `FooService::class`, the cached instance is stored under `FooInterface::class`, not under the concrete class name.

A separate abstract key pointing to the same concrete class would get its own cached instance unless you seed the container manually.

### Registered classes win over manual args

When a parameter type is registered, the resolver injects the shared dependency even if the caller supplied manual values in `$args`.

Manual arguments are only consumed after typed dependency resolution fails.

### Array-typed parameters receive all remaining args

For an `array` parameter, the resolver returns the remaining `$args` array as-is.

It does not shift one array element.

### Unresolvable parameters fall back to defaults or `null`

When the resolver cannot produce a value from typed dependencies or manual args, it returns:

1. the default value, if present
2. otherwise `null`

The package does not throw its own exception for missing required scalar values.

## Callable contracts

### `autowire()` returns arguments only

`autowire()` prepares an argument list and returns it. The caller is responsible for invoking the callable.

### Only closures and array callables are accepted

These are accepted for argument resolution:

- `function () {}`
- `[$service, 'handle']`
- `[Handler::class, 'run']`

Class-string array callables are only practical when the target method is static or when you use the reflected signature and then invoke the method yourself on an instance. The container does not instantiate the target object for you.

These are rejected by the current implementation:

- `'strlen'`
- invokable objects such as `new Handler()` with `__invoke()`

Rejected callable shapes throw `DiException::invalidCallable(...)`.

## Reset contracts

### `resetContainer()` preserves bindings

`resetContainer()` clears only cached shared instances and the active circular-dependency map.

Registered bindings remain available.

### `reset()` clears everything

`reset()` calls both `DiRegistry::reset()` and `resetContainer()`.

After `reset()`, the container behaves like a fresh empty container.

## Exception messages

The package defines dedicated messages for:

- unregistered dependencies
- duplicate dependencies
- non-instantiable concretes
- invalid abstract dependencies
- circular dependency chains
- invalid callable input

All package-level validation errors use `Quantum\Di\Exceptions\DiException`.