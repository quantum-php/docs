# Services

## Overview

Services in Quantum PHP Framework are a key architectural abstraction used to encapsulate domain logic and coordinate data operations. They provide a reusable, organized layer between controllers and models, helping keep business logic clean, testable, and maintainable.

Services commonly interact with models, data transfer objects (DTOs), transformers, and storage utilities to implement application-specific behaviors.

---

## Role of Services

- Encapsulate business rules, data processing, and complex logic.
- Coordinate model interactions and data transformations.
- Hide data access details from controllers.
- Enable cleaner, more modular code and separation of concerns.
- Support dependency injection to manage dependencies such as transformers and other services.

---

## Example Usage

The default API Demo module contains several example services: `AuthService`, `PostService`, and `CommentService`, each focused on a distinct domain area.

### AuthService

- Manages user data lifecycle: create, read, update, delete.
- Handles user directory creation for uploaded files.
- Defines user schema metadata to control data visibility.
- Interfaces with underlying User model and uses `AuthUser` for authentication-related behaviors.

### PostService

- Handles retrieval and pagination of posts with optional search filtering.
- Joins post data with related user information.
- Uses `PostTransformer` to format output data cleanly.
- Encapsulates post-specific logic separate from controllers or models.

---

## Service Implementation Patterns

- Extend base class `Quantum\Service\Service` for core functionality.
- Inject dependencies through constructor parameters.
- Throw framework-specific exceptions for error handling.
- Use model query methods for data retrieval and manipulation.
- Incorporate transformers for formatting output data.

---

## Service Factory Contract

The `service(string $serviceClass, bool $singleton = false)` helper function provides a factory mechanism for instantiating services:

- **`$singleton = false` (default)**: Returns a fresh instance of the service via `ServiceFactory::create()`, which invokes `Di::create()` to resolve dependencies.
- **`$singleton = true`**: Returns a shared instance of the service via `ServiceFactory::get()`, which invokes `Di::get()` to return a singleton from the DI container.


---

## Creating a New Service Example

Here is a basic example of creating a new service in Quantum PHP Framework:

```php
namespace Modules\YourModule\Services;

use Quantum\Service\Service;
use Quantum\Model\ModelCollection;
use Modules\YourModule\Models\YourModel;

class YourService extends Service
{
    private YourModel $model;

    public function __construct()
    {
        $this->model = model(YourModel::class);
    }

    public function getAll(): ModelCollection
    {
        return $this->model->get();
    }

    public function findById(string $id)
    {
        return $this->model->findOneBy('id', $id);
    }

    // Add other domain-specific methods here
}
```

---

## Benefits of Using Services

- Improve code organization by logically grouping related operations.
- Simplify controllers by moving complex logic out of request handlers.
- Facilitate testing by isolating business logic in standalone classes.
- Encourage reusability and consistency across the application.

---

## Next Steps

Explore:

- [Models](../core-concepts/models.md)
- [Transformers](../packages/transformer/overview.md)
- [Dependency Injection](../advanced-features/dependency-injection.md)

## Related Topics

- See the [Service Lifecycle Management](../core-concepts/services.md) section for additional context.
