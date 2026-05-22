# Service Contracts

This page describes the behaviors you can rely on when integrating with the Service package.

## Service type contract

A class must extend `Quantum\Service\Service`.

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
- returns the shared instance for that service class
- accepts runtime constructor arguments

## Helper contract

```php
service(string $serviceClass, bool $singleton = false): Service
```

Behavior:

- `false` resolves a fresh instance
- `true` resolves the shared instance
- helper does not accept constructor args

If you need runtime args, use `ServiceFactory::create()` or `ServiceFactory::get()`.

## Undefined method contract

Undefined method calls throw immediately.

Practical effect: service method typos fail fast instead of being silently ignored.

## Failure cases to handle

- service class does not exist
- class exists but does not extend `Quantum\Service\Service`
- constructor dependencies cannot be resolved
- undefined service method is called
