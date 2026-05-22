# Service Usage

## Create a service class

Start with a class that extends the framework base service.

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

This is enough to make the class valid for `ServiceFactory` and the `service()` helper.

## Resolve a fresh service instance

```php
use App\Modules\Billing\Services\InvoiceService;

$service = service(InvoiceService::class);
$service->send(15);
```

This path creates a new service instance each time you call the helper.

## Resolve a shared service instance

```php
$service = service(InvoiceService::class, true);
```

Use the shared form when the service should be reused through the container, for example when it holds collaborators that you want to instantiate once.

## Pass runtime constructor arguments

When your service constructor needs explicit runtime values, use the factory directly.

```php
use Quantum\Service\Factories\ServiceFactory;

$service = ServiceFactory::create(InvoiceService::class, [
    'tenantId' => $tenantId,
]);
```

The `service()` helper cannot pass custom arguments.

## Compose services with DI

Because service resolution goes through the DI container, constructor-injected dependencies are supported.

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

Keep in mind that singleton resolution also shares that constructed dependency graph for the lifetime of the DI entry.

## Common pitfalls

### Do not pass plain classes

```php
service(stdClass::class);
```

This fails because `stdClass` is not a subclass of `Quantum\Service\Service`.

### Choose singleton mode intentionally

The helper defaults to a fresh instance. If you expected shared state or one-time setup reuse, pass `true` explicitly.

### Avoid relying on magic method forwarding

If a method is not defined on the service class, the base class throws instead of silently proxying the call.
