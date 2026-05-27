# Service Contracts

This page describes the behaviors you can rely on when integrating with the Service package.

## Service type contract

Use subclasses of `Quantum\Service\Service` as service targets.

```php
use Quantum\Service\Service;

class ReportService extends Service
{
}
```

Non-service classes are rejected before resolution.

## Resolution modes

### `ServiceFactory::create(string $serviceClass, array $args = [])`

Contract:

- validates service class eligibility
- returns a fresh instance
- accepts runtime constructor arguments

### `ServiceFactory::get(string $serviceClass, array $args = [])`

Contract:

- validates service class eligibility
- registers the service class with DI when needed
- returns the shared instance for that service class
- applies runtime constructor arguments when the shared instance is created
- reuses the same shared instance on later calls for the same service class

## Helper contract

```php
service(string $serviceClass, bool $singleton = false): Service
```

Behavior:

- `false` resolves a fresh instance
- `true` resolves the shared instance
- helper does not accept constructor args

If you need runtime args, use `ServiceFactory::create()` or `ServiceFactory::get()`.
For shared services, pass those args on the first `get()` call that creates the instance.

## Undefined method contract

Undefined method calls throw immediately.

Practical effect: service method typos surface immediately instead of being silently ignored.

## Exception cases to handle

- service class does not exist
- class exists but does not extend `Quantum\Service\Service`
- constructor dependencies do not resolve through DI or provided args
- undefined service method is called
