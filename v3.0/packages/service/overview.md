# Service

The Service package gives you a small base class and factory layer for application services.

Use it when you want to keep business logic outside controllers and instantiate service classes through Quantum's DI container.

## What the package provides

- `Quantum\Service\Service` as the base class for service objects
- `ServiceFactory::create()` for a fresh service instance
- `ServiceFactory::get()` for a shared DI-managed instance
- the `service()` helper for quick resolution

## Typical usage

```php
use App\Modules\Blog\Services\PostService;

$postService = service(PostService::class);
$sharedPostService = service(PostService::class, true);
```

Use the default form when you want a new instance for the current call. Use the singleton form when you want the same DI-managed instance reused.

## How it fits into an app

A service class usually coordinates models, other services, or framework helpers:

```php
namespace App\Modules\Blog\Services;

use Quantum\Service\Service;

class PostService extends Service
{
    public function publish(int $id): void
    {
        // domain logic here
    }
}
```

The package itself does not add lifecycle hooks, configuration files, or adapter selection. Its main job is validating that a class is a real Quantum service and then resolving it through the DI container.

## Key caveats

- Only classes that extend `Quantum\Service\Service` can be resolved through `ServiceFactory` or the `service()` helper.
- `service($class)` creates a new instance by default; it is not shared unless you pass `true` as the second argument.
- The base `Service` class throws if you call an undefined method, so magic fallbacks are not part of the contract.

## Read next

- [Contracts](contracts.md)
- [Usage](usage.md)
- [Dependency Injection](../../advanced-features/dependency-injection.md)
