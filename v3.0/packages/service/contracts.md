# Service Contracts

## Service class contract

A class must extend `Quantum\Service\Service` to be treated as a framework service.

```php
use Quantum\Service\Service;

class ReportService extends Service
{
}
```

If you pass any other class to `ServiceFactory` or `service()`, the package throws a service exception before DI resolution begins.

## Resolution contract

The package exposes two resolution modes:

### `ServiceFactory::create(string $serviceClass, array $args = [])`

- validates that the class exists
- validates that the class extends `Quantum\Service\Service`
- returns a fresh instance through `Di::create()`

Use this when constructor arguments or mutable state should not be shared.

### `ServiceFactory::get(string $serviceClass, array $args = [])`

- runs the same class validation as `create()`
- registers the class with the DI container if it is not already registered
- returns the DI-managed instance through `Di::get()`

Use this when you want one shared instance for that class in the container.

## Helper contract

```php
service(string $serviceClass, bool $singleton = false): Service
```

Behavior:

- `false` uses `ServiceFactory::create()`
- `true` uses `ServiceFactory::get()`
- the helper does not expose the factory's `$args` parameter

That last point matters: if your service constructor needs runtime arguments, call `ServiceFactory::create()` or `ServiceFactory::get()` directly instead of the helper.

## Undefined method behavior

The base `Service` class implements `__call()` and always throws a service exception for unsupported methods.

Practical effect:

- calling a typo such as `$service->publsih()` fails immediately
- dynamic method forwarding is not built into the base class

## Failure behavior

Common failures you should expect:

- the service class does not exist
- the class exists but does not extend `Quantum\Service\Service`
- DI resolution fails because constructor dependencies cannot be resolved
- an undefined service method is called at runtime
