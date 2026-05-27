# Service

Service provides a simple base class and resolver pattern for application services.

Use it when you want business logic outside controllers and want predictable service resolution through Quantum.

## What it gives you

- `Quantum\Service\Service` base class
- `service()` helper for quick resolution
- `ServiceFactory::create()` for fresh instances
- `ServiceFactory::get()` for shared instances
- direct resolution of concrete service classes without a separate DI registration step

## Quick example

```php
use App\Modules\Blog\Services\PostService;

$postService = service(PostService::class);
$sharedPostService = service(PostService::class, true);
```

Default resolution returns a fresh instance. Pass `true` to reuse the shared instance for that service class.

## Typical service shape

```php
namespace App\Modules\Blog\Services;

use Quantum\Service\Service;

class PostService extends Service
{
    public function publish(int $id): void
    {
        // domain logic
    }
}
```

## Key constraints

- Only classes extending `Quantum\Service\Service` are valid service targets.
- `service($class)` is fresh-by-default.
- Undefined method calls on services throw immediately.

## Read next

- [Usage](usage.md)
- [Contracts](contracts.md)
- [Dependency Injection](../../advanced-features/dependency-injection.md)
