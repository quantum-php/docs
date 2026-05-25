# Di Usage

This package gives you two main workflows:

- register a binding and resolve a shared instance with `get()`
- create a fresh object graph on demand with `create()` or `autowire()`

## Register an interface binding

Use `register()` when application code depends on an interface or abstract class name.

```php
use App\Contracts\MailerInterface;
use App\Services\SmtpMailer;
use Quantum\Di\Di;

Di::register(SmtpMailer::class, MailerInterface::class);

$mailer = Di::get(MailerInterface::class);
```

`get()` returns the same shared instance on later calls for `MailerInterface::class`.

## Create a class without pre-registration

Use `create()` when you want a fresh instance and do not need shared caching.

```php
use App\Services\ReportBuilder;
use Quantum\Di\Di;

$builderA = Di::create(ReportBuilder::class);
$builderB = Di::create(ReportBuilder::class);
```

`$builderA` and `$builderB` are different objects.

Because `create()` auto-registers missing classes against themselves, this works even when `ReportBuilder` was not registered earlier.
That self-registration persists in the container registry, so a later `Di::get(ReportBuilder::class)` call will succeed and start returning a shared instance for that class key.

## Seed a prebuilt instance

Use `set()` when you already have an object and want the container to return it later.

```php
use App\Contracts\ClockInterface;
use App\Testing\FakeClock;
use Quantum\Di\Di;

Di::set(ClockInterface::class, new FakeClock());

$clock = Di::get(ClockInterface::class);
```

The current implementation has two gotchas:

- you cannot call `set()` twice for the same abstract once an instance already exists
- the abstract key must be a real class or interface name

Also, `set()` seeds only the runtime container entry. If you clear the container with `Di::resetContainer()`, the seeded object is removed and future `get()` calls fall back to the registered concrete binding.

## Autowire a callable

`autowire()` prepares the arguments for a closure or array callable.

```php
use App\Contracts\MailerInterface;
use Quantum\Di\Di;

$args = Di::autowire(
    function (MailerInterface $mailer, string $subject = 'Hello') {
        return [$mailer, $subject];
    },
    ['Weekly digest']
);
```

The returned `$args` array contains the resolved mailer instance plus the manual subject argument.

You still invoke the callable yourself:

```php
$result = (function (MailerInterface $mailer, string $subject = 'Hello') {
    return [$mailer, $subject];
})(...$args);
```

If you pass a class-string array callable such as `[Handler::class, 'run']`, `autowire()` only reflects the method signature. It does not create a `Handler` instance or perform the method call for you.

## Understand argument precedence

Constructor and callable parameters are resolved in a strict order.

### Registered services come first

If a parameter type is registered in the container, that dependency is injected before any manual argument is consumed.

### Instantiable classes come next

If the type is not registered but names an instantiable class, the container creates it automatically.

### Scalar values are positional

For non-class parameters, manual `$args` are consumed with `array_shift()`.

```php
$args = Di::autowire(
    function (string $name, int $count) {},
    ['cache', 3]
);
```

The resolver does not match by parameter name.

### Array parameters capture the remaining args

If a parameter is typed as `array`, it receives the full remaining manual argument list.

```php
$args = Di::autowire(
    function (array $payload) {},
    ['a' => 1, 'b' => 2]
);
```

In the current implementation, `$payload` becomes the remaining `$args` array exactly as held by the resolver.

## Handle circular dependencies early

If class graphs reference each other in a loop, resolution fails with `DiException::circularDependency(...)`.

Example shape:

- `A` depends on `B`
- `B` depends on `A`

The exception message includes the chain that was being resolved.

## Reset state in tests or isolated runs

Use:

- `Di::resetContainer()` to clear shared instances but keep bindings
- `Di::reset()` to clear both bindings and shared instances

`reset()` is the stronger reset and is usually the safer option for test isolation.

## Caveats

- `get()` fails for unknown abstractions; it does not auto-register them.
- `autowire()` does not accept string callables or invokable objects.
- Missing required scalar parameters can fall through as `null` and fail later when PHP enforces the signature.
- Shared instances are container-scoped. If the app context changes containers, later `Di::...` calls follow the new container.