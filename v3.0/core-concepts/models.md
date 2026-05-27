# Models

## Overview

Models in Quantum PHP Framework provide a structured way to represent and manipulate application data. They encapsulate data attributes, business rules, and database interactions in a clear and reusable class.

Quantum provides a layered model system starting from a base `Model` class and extending to `DbModel` for database-backed entities.

---

## Base Model Class

- Manages attributes with support for fillable and hidden properties.
- Allows safe filling of data and conversion to arrays with hidden property filtering.
- Implements magic getters/setters for attribute access.
- Checks for empty models via attribute presence.

---

## DbModel Class

- Extends the base Model to integrate with an ORM instance (e.g., Idiorm, SleekDB).
- Adds querying capabilities including filters, joins, pagination, sorting, and grouping.
- Handles database record fetching, creation, updating, saving, and deletion.
- Supports wrapping ORM results as model instances.
- Syncs model attributes with ORM properties for persistence.
- Throws domain-specific exceptions for ORM or model errors.

---

## Usage Pattern

```php
namespace Modules\YourModule\Models;

use Quantum\Model\DbModel;

class YourModel extends DbModel
{
    public string $table = 'your_table_name';

    public string $idColumn = 'id';

    public array $fillable = [
        'name',
        'email',
        // other columns
    ];

    public array $hidden = [
        'password',
        // sensitive fields
    ];

    // Define relationships and custom methods here
}
```

---

## How to Use Models

Typically, models are accessed and manipulated through service classes using the `model()` helper function.

Inside a service:

```php
public function __construct()
{
    $this->model = model(YourModel::class);
}

public function getAll()
{
    return $this->model->get();
}

public function findById(string $id)
{
    return $this->model->findOneBy('id', $id);
}
```

Services encapsulate business logic and data operations, and controllers or other app components call these services.

---

## Model Relationships

Quantum models define relationships to other models using the `relations()` method.

This method returns an array mapping related model classes to configuration arrays specifying:

- `type`: Relation type (e.g., `Relation::BELONGS_TO`, `Relation::HAS_MANY`, `Relation::HAS_ONE`)
- `foreign_key`: The foreign key column in the related model
- `local_key`: The local key column in the current model

### Relationship Types

- `Relation::BELONGS_TO`: This model belongs to the related model (many-to-one).
- `Relation::HAS_MANY`: This model has many related models (one-to-many).
- `Relation::HAS_ONE`: This model has a single related model (one-to-one).

### Example:

```php
public function relations(): array
{
    return [
        User::class => [
            'type' => Relation::BELONGS_TO,
            'foreign_key' => 'user_uuid',
            'local_key' => 'uuid',
        ]
    ];
}
```

This definition allows the framework to understand and resolve model associations for queries and data access.

---

## Benefits of Using Models

- Centralize data representation and logic.
- Facilitate database interaction and query building.
- Promote secure attribute handling.
- Enable conversion between ORM results and application objects.
- Support clean and testable domain logic.

---

## What to read next

After models, continue with:

- [Services](services.md)
- [Database](../advanced-features/database.md)
- [Migration](../advanced-features/migration.md)
