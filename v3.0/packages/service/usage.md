# Service Usage

## Create a service class

```php
namespace App\Modules\Billing\Services;

use Quantum\Service\Service;

class InvoiceService extends Service
{
    public function send(int $invoiceId): void
    {
        // business logic
    }
}
```

Resolve service classes from subclasses of `Quantum\Service\Service`.

## Resolve a fresh instance

```php
use App\Modules\Billing\Services\InvoiceService;

$service = service(InvoiceService::class);
$service->send(15);
```

Use this when each call should get its own instance.

## Resolve a shared instance

```php
$service = service(InvoiceService::class, true);
```

Use shared mode when the same service instance should be reused.
The shared cache key is the service class name.

## Pass runtime constructor arguments

Use the factory directly when constructor values are runtime-specific:

```php
use Quantum\Service\Factories\ServiceFactory;

$service = ServiceFactory::create(InvoiceService::class, [
    'tenantId' => $tenantId,
]);
```

`service()` does not accept custom constructor args.
For shared services, provide runtime args on the first `ServiceFactory::get()` call that creates the instance.

## Compose services with DI

```php
class InvoiceService extends Service
{
    public function __construct(
        private MailerService $mailer,
        private InvoiceRepository $invoices,
    ) {
    }
}
```

Constructor dependencies are resolved through DI.

## Common pitfalls

### Passing a non-service class

```php
service(stdClass::class);
```

This call is accepted for subclasses of `Quantum\Service\Service`.
Use a concrete service class here.

### Forgetting shared mode

If you expect reuse, pass `true` explicitly.

### Relying on undefined methods

Typos like `$service->publsih()` raise an exception immediately.
