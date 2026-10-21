# Event Usage

## Dispatch an event and listen to it

Pick a name that says what happened, and dispatch it where it happens:

```php
event()->dispatch('user.registered', ['user' => $user]);
```

Anywhere else, listen for it. The listener receives the payload array:

```php
event()->listen('user.registered', function (array $payload) {
    $user = $payload['user'];

    // send the welcome email
});
```

A listener can be any PHP callable: a closure, an invokable object, or `[$object, 'method']`.

## Where to register listeners

A listener only runs if it was registered before the event is dispatched. The safe place is a file in your project's `helpers/` directory, or in a module's `helpers/` directory. Quantum loads those files early in the boot, so their listeners are in place for every event, the framework's [request and command events](../app/architecture.md#hooking-into-the-running-app) included:

```php
// helpers/events.php
event()->listen('user.registered', function (array $payload) {
    // ...
});
```

## Several listeners for one event

Listeners run in the order they were registered, and each one runs on every dispatch:

```php
event()->listen('order.paid', function (array $payload) {
    // update the stock
});

event()->listen('order.paid', function (array $payload) {
    // email the receipt
});

event()->dispatch('order.paid', ['order' => $order]); // both run
event()->dispatch('order.paid', ['order' => $other]); // both run again
```

If a listener throws, the listeners after it do not run and the exception reaches the code that called `dispatch()`.

## See what is registered

```php
$listeners = event()->getRegistered();
// ['order.paid' => [callable, callable], ...]
```

With the debug bar enabled, a matched web request shows the same list in its `events` tab.

## Coming from `hook()`

The Event package replaces the Hook package:

| Hook | Event |
| :--- | :--- |
| `hook()->on($name, $fn)` | `event()->listen($name, $fn)` |
| `hook()->fire($name, $args)` | `event()->dispatch($name, $payload)` |
| names declared in `shared/config/hooks.php` | no declaration; that file is not read |
| a listener ran once, then was removed | a listener runs on every dispatch |
| listener received `?array $args` | listener receives `array $payload` (empty when none is given) |
