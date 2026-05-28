# Dependency Injection (DI)

## Overview

Quantum PHP Framework uses a powerful Dependency Injection system to manage class dependencies, lifecycle, and automatic wiring, enabling loose coupling and easier testing.

The DI system centers around three main classes:

- `Di`: A static facade forwarding requests to the DI container in the app context.
- `DiContainer`: A container holding dependency registrations, resolved instances, and implementing the core logic.
- `DiRegistry`: Stores and validates dependency bindings.

## Core Concepts

- **Registration**: Bind interfaces or abstract names to concrete classes.
- **Resolution**: Retrieve shared or new instances, recursively resolving their constructor dependencies.
- **Autowiring**: Use reflection to automatically supply constructor or callable parameters.
- **Singleton Management**: Cached instances returned for shared dependencies.
- **Circular Dependency Detection**: Prevent infinite recursion in dependency graphs.

## Key API Methods

- `Di::register(string $concrete, ?string $abstract = null)`: Register a dependency.
- `Di::get(string $abstract, array $args = [])`: Retrieve shared instance.
- `Di::create(string $abstract, array $args = [])`: Create a new instance.
- `Di::autowire(callable $callable, array $args = [])`: Autowire parameters for a callable. This method returns an array of resolved arguments and does not invoke the callable.

Usage:

```php
$args = Di::autowire($callable, $inputArgs);
$callable(...$args);
```
- `Di::set(string $abstract, object $instance, bool $override = true)`: Manually set an instance, optionally preventing an override of existing registered instances by setting `$override` to `false`. If the dependency is already registered and `override` is `false`, the method throws an exception.

## Usage Example

```php
use Quantum\Di\Di;

// Register interface to class binding
Di::register(FooService::class, FooInterface::class);

// Get singleton instance
$foo = Di::get(FooInterface::class);

// Create new instance
$newFoo = Di::create(FooService::class);

// Autowire callable
Di::autowire(function(FooInterface $foo, BarService $bar) {
    // Use injected dependencies
});
```

## How It Works

- `DiContainer` stores mappings and instances.
- Upon `get` or `create`, it resolves dependencies recursively using reflection.
- Checks circular dependencies and throws exceptions if found.
- Uses `DiRegistry` to validate and fetch concrete implementations.

## Best Practices

- Register dependencies at application boot.
- Use interfaces for type-hinting to decouple code.
- Avoid circular references.
- Prefer autowiring with constructor injection.

## What to read next

After DI concepts, continue with:

- [Services](../core-concepts/services.md)
- [Modules](../core-concepts/modules.md)
- [Configuration](configuration.md)


