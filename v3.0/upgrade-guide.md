# Upgrade Guide

This guide summarizes the changes to make when you upgrade a Quantum project. It has two parts: [3.0 to 3.1](#upgrading-from-30-to-31) and [2.x to 3.0](#upgrading-from-2x-to-30).

## Upgrading from 3.0 to 3.1

3.1 raises the PHP minimum, moves some dependencies to newer lines and reworks parts of the internals. Each section below says what changed, what to do about it, and where no action is needed.

### 1. Platform and dependencies

**PHP 8.1 or newer.** An application on PHP 8.0 stays on 3.0.x. Check `php -v`, the `php` constraint in your `composer.json` (`^8.1`) and the PHP versions your CI runs.

**Symfony 6.4.** `symfony/console`, `symfony/var-dumper` and `symfony/var-exporter` are on the `^6.4` line. Commands that extend `Quantum\Console\CliCommand` need no change. A class in your application that extends a Symfony class directly may need Symfony 6's stricter return types.

**`psr/log` 2 or 3.** The framework accepts both, so an application that uses `psr/log` 3 (for example through Monolog 3) can now install it. The nine PSR-3 methods of `Quantum\Logger\Logger` declare `string|Stringable $message`. A class that extends `Logger` and overrides them must declare the same type:

```php
use Stringable;

// before
public function info($message, array $context = []): void

// after
public function info(string|Stringable $message, array $context = []): void
```

**Return types.** `Quantum\HttpClient\ResponseHeaders` declares `offsetGet()`, `current()` and `key()` as `mixed`, and `Quantum\Session\Adapters\Database\DatabaseHandler::gc()` as `int|false`, because PHP 8.1 expects them. A subclass that overrides these methods must declare compatible return types. `gc()` also returns the number of deleted sessions now; it returned `0` after any successful delete.

**No action needed:** private properties that are only set in the constructor are `readonly` now, so subclasses are unaffected, and `ErrorHandler` registers closures instead of array callables. Only a test that reads the registered handler back from PHP sees the difference.

### 2. OpenAPI documentation is written as attributes

The `DefaultApi` and `DemoApi` module templates describe the API with PHP attributes (`#[OA\Get(...)]`) instead of `@OA\...` docblock annotations, and the framework no longer requires `doctrine/annotations`. Modules you generate from 3.1 on need nothing. See [OpenAPI resource generation](cli/code-generation.md#openapi-resource-generation) for what `install:openapi` produces.

An existing module still has `@OA` docblocks in `Controllers/OpenApi`. A `spec.json` that was already generated keeps being served. Generating a new one from those docblocks fails with `Required @OA\PathItem() not found`, because swagger-php reads docblock annotations only when `doctrine/annotations` is installed. Do one of these:

- convert the annotations to attributes, or
- keep them and run `composer require doctrine/annotations`.

Converting is mechanical. A nested annotation becomes a named argument of its parent, `{...}` becomes `[...]`, and `=` becomes `:`:

```php
// before
/**
 * @OA\Get(
 *     path="/api/status",
 *     summary="Get status",
 *     @OA\Response(response=200, description="Success")
 * )
 */
abstract public function status();

// after
use OpenApi\Attributes as OA;

#[OA\Get(
    path: '/api/status',
    summary: 'Get status',
    responses: [
        new OA\Response(response: 200, description: 'Success'),
    ]
)]
abstract public function status();
```

Several nested responses, parameters or properties go in one list (`responses: [...]`, `parameters: [...]`, `properties: [...]`). A single `@OA\JsonContent`, `@OA\Schema` or `@OA\RequestBody` is passed as one `new OA\...(...)` to `content`, `schema` or `requestBody`.

### 3. Deprecations are logged, not thrown

Quantum's error handler used to turn every reported PHP error into an `ErrorException`, deprecations too. On PHP 8.1 and newer, that meant a library calling a deprecated function could stop a request. Now a deprecation (`E_DEPRECATED` or `E_USER_DEPRECATED`) is logged as a warning, `<message> in <file>:<line>`, and the script goes on. Notices, warnings and other errors still throw.

You do not need to change anything, but check your log after the upgrade: deprecations from your own code and your dependencies show up there as warnings. A test that expects a deprecation to throw an `ErrorException` must be updated. The [Tracer contracts](packages/tracer/contracts.md#error-conversion-contract) describe the rule.

### 4. `Hook` is replaced by `Event`

If your code calls `hook()`, it needs three renames and a clean-up. The names changed, and so did a few rules:

```php
// before
hook()->on('user.registered', function ($args) {
    // ...
});
hook()->fire('user.registered', ['user' => $user]);

// after
event()->listen('user.registered', function (array $payload) {
    // ...
});
event()->dispatch('user.registered', ['user' => $user]);
```

- `hook()` is `event()`, `on()` is `listen()` and `fire()` is `dispatch()`. No aliases remain.
- Delete `shared/config/hooks.php`: event names no longer need to be registered, and the file is not read. Dispatching a name nobody listens to does nothing. An empty name throws `EventException`.
- A listener always receives one array, which is empty when `dispatch()` got no payload. A hook listener received `null` in that case.
- Listeners stay registered after `dispatch()` and run on every dispatch. A hook listener ran once and was removed. If a listener must run only once, guard it with a flag inside the listener.
- Register listeners in a `helpers/` file of the project or of a module, which loads early enough to catch the framework's own events. See [Event usage](packages/event/usage.md#where-to-register-listeners).
- The debugger constant `Debugger::HOOKS` is `Debugger::EVENTS`, the debugbar tab is `events` and lists only events that have listeners, and the unused `hooks_dir()` helper is gone.

### 5. `Quantum\Loader` is removed

`Setup` moved to the config package, and the loading itself moved to the packages that own it. The constructor of `Setup` is unchanged, so for most code the upgrade is one import:

```php
// before
use Quantum\Loader\Setup;

// after
use Quantum\Config\Setup;

config()->import(new Setup('config', 'payments'));
```

- A required config file that is missing throws `ConfigException` (there is no `LoaderException` any more). To load a file only when it exists, use `config()->importIfExists(new Setup(...))`, which returns `false` for a missing file.
- Config paths resolve from the application base directory, not from the working directory of the process, so a command run from another folder finds the same files.
- `Environment::load()` takes no argument. It reads `shared/config/env.php` and the matching `.env` file, and reports a missing file with `EnvException`. Remove a `new Setup(...)` argument if you call it yourself.
- No action needed for the helper files: the boot loads the component, app and module helpers directly.

See the [Config package](packages/config/overview.md) for the loading rules.

### 6. The app boots and runs through pipelines of stages

The web and the console app now run their boot and their runtime as a `Quantum\App\Pipeline` of stages. If your entry point goes through `AppFactory`, nothing changes:

```php
AppFactory::create(AppType::WEB, $baseDir)->start();
```

The sections below matter only if you create an adapter yourself, write your own boot stage, import one of the moved classes or build an `AppContext`. [App architecture](packages/app/architecture.md) explains the model.

**Boot is its own step.** The adapter constructors only store the context, and `AppFactory` calls `boot()` right after creating the adapter. When you create an adapter yourself, call `boot()` before `start()`:

```php
$adapter = new WebAppAdapter($context);
$adapter->boot();
$adapter->start();
```

**Moved and removed classes.** Update your imports:

| 3.0 | 3.1 |
| --- | --- |
| `Quantum\App\Adapters\WebAppAdapter` | `Quantum\App\Adapters\Web\WebAppAdapter` |
| `Quantum\App\Adapters\ConsoleAppAdapter` | `Quantum\App\Adapters\Console\ConsoleAppAdapter` |
| `Quantum\App\Stages\InitHttpStage`, `LoadModulesStage` | `Quantum\App\Adapters\Web\Stages\Boot\...` |
| `Quantum\App\Stages\LoadAppConfigStage`, `LoadEnvironmentStage`, `LoadHelpersStage`, `SetupErrorHandlerStage` | `Quantum\App\Stages\Boot\...` |
| `Quantum\App\BootPipeline` | `Quantum\App\Pipeline` |
| `Quantum\App\Contracts\BootStageInterface` | `Quantum\App\Contracts\StageInterface` |
| `AppAdapter`, `WebAppTrait`, `ConsoleAppTrait` | removed: the adapters implement `AppInterface` directly |

**Custom stages.** A stage implements `StageInterface` and names the context it works with in its class docblock. The type is checked by PHPStan only, so the method signature stays the same:

```php
// before
class WarmCacheStage implements BootStageInterface
{
    public function process(AppContext $context): void
    {
        // ...
    }
}

(new BootPipeline([new WarmCacheStage()]))->run($context);

// after
/**
 * @implements StageInterface<AppContext>
 */
class WarmCacheStage implements StageInterface
{
    public function process(AppContext $context): void
    {
        // ...
    }
}

(new Pipeline([new WarmCacheStage()]))->run($context);
```

A stage that calls `$context->stop()` ends the run, and an optional closing stage, the second argument of `Pipeline`, runs last.

**`AppContext`.**

- Its constructor takes the app type as a third, required argument: `new AppContext($baseDir, $container, AppType::WEB)`. `AppFactory` passes it for you.
- `getRequest()`, `getResponse()` and `getRoutes()` are gone from `AppContext`. In a web stage use `WebContext::getRequest()` and `WebContext::getRoutes()` (`WebContext::getResponse()` is the response about to be sent). Elsewhere use `request()` and `response()`.
- It gained `getType()`, `stop()`, `isStopped()`, `getExitCode()` and `setExitCode()`. To ask which app is running, use `is_web_app()` and `is_console_app()`.

### 7. The console boots in explicit steps

`php qt` boots as a pipeline now (see the previous section). Most commands run exactly as before. Check the cases below if you have your own commands in `shared/Commands` or you touched the console adapter.

**A command that changes `.env`.** The console no longer makes the environment writable for every command. A command that calls `environment()->updateRow()` must call `setMutable(true)` first, otherwise it throws `EnvException::environmentImmutable()`. `core:key` and the Toolkit installer already do it themselves.

```php
// before
public function exec(): void
{
    environment()->updateRow('FEATURE_X', 'on');
}

// after
public function exec(): void
{
    environment()->setMutable(true);
    environment()->updateRow('FEATURE_X', 'on');
}
```

**Getting the Symfony application.** `ConsoleAppAdapter::createApplication()` is gone. The boot registers the application in the container, so get it from there:

```php
use Symfony\Component\Console\Application;

$application = Di::get(Application::class);
```

**A broken `.env`.** The console no longer decides by the `core:env` command name. With a missing or malformed `.env`, the framework commands that set `$requiresEnvironment` to `false` (`core:env`) and Symfony's `list` and `help` still run, and every other command stops with the error of the environment file. Your own commands need no change and keep the default (`true`). With a valid `.env`, `core:env` now runs the full boot. [Commands without a working environment](cli/qt-command-line-tool.md#commands-without-a-working-environment) explains the rule.

**No action needed:** your commands are registered last, after the environment and the config load, so their constructors can use `env()` and `config()`.

### 8. The debug toolbar reads its data when it renders

Packages no longer write into the debugger while a request runs. The logger, the mailer, the database layer and the view each keep their own state, and the toolbar collects it when it renders. If you only use `debugbar()->addToStoreCell()` to add your own entries, nothing changes. Check the cases below if you wrote a custom mailer adapter, built a `View` yourself, or read the toolbar's tabs. [Debugger architecture](packages/debugger/architecture.md#where-each-tabs-data-comes-from) lists where each tab's data comes from.

**A custom mailer adapter.** `MailerInterface` gains `getTransportLog(): array`, which `MailerTrait` implements. An adapter that implements the interface without the trait must add the method:

```php
public function getTransportLog(): array
{
    return $this->transportLog;
}
```

See [Transport log](packages/mailer/contracts.md#transport-log) for what the log holds.

**The logger's `message` adapter.** In debug mode the web app's logger keeps its messages in memory (`getMessages()`) instead of writing them into the debugger store, and it ignores the `tab` key of the log context. A message logged with a tab is listed in the `messages` tab, and `debugbar()->getStoreCell('messages')` returns only what you wrote there directly.

**The `View` constructor.** `View::__construct()` no longer takes a `Debugger`. It is `(Renderer, AssetManager, ViewCache)`. Code that gets the view through `view()` or `ViewFactory` is unaffected. `View::getViewFile()` returns the last view rendered with `render()`.

**Tabs on first write.** `InitDebuggerStage` (`Quantum\App\Stages\InitDebuggerStage` in 3.0) is removed from the web boot, and the debugger store creates a tab on its first write. Remove the stage from a custom boot pipeline. Code that wants all the tabs up front calls `debugbar()->initStore()`. The `events` tab lists the listeners registered when the toolbar renders, so listeners added later in the request, for example in a controller, are listed too.

**New limits.** The `message` adapter keeps the last `logging.message.limit` messages, and a mailer cuts its transport log to the last `mailer.transport_log_limit` lines at the start of each send. Both default to `1000`, and `0` keeps everything. Add the keys to `shared/config/logging.php` and `shared/config/mailer.php` only if you want another value; see the [`message` adapter](packages/logger/adapters.md#message) and the [transport log](packages/mailer/contracts.md#transport-log).

**The console logs to files in debug mode.** The in-memory `message` adapter is used by the web app only. In debug mode the console logs to the adapter you configured, or the one you ask for, so a command's log lines are written instead of lost.

### 9. The Lang configuration selects an adapter

Lang can now translate through DeepL or Google Translate, so `default` in `shared/config/lang.php` selects the adapter, and the fallback locale moved to `default_locale`. The unused `enabled` toggle is gone:

```php
// before
return [
    'enabled' => true,
    'supported' => ['en', 'es'],
    'default' => 'en',
    'url_segment' => 1,
];

// after
return [
    'supported' => ['en', 'es'],
    'default' => 'file',
    'default_locale' => 'en',
    'url_segment' => 1,
];
```

- `default` is the adapter: `file` (translation files, the behavior you had), `deepl` or `google_translate`. A missing value throws a `LangException`.
- `default_locale` is the language used when none is detected. It holds what `default` held before.
- Remove `enabled`. `Lang::isEnabled()` is removed too, because it no longer affected anything; delete the calls.
- Translation files load on first use now, not during the web boot.

The starter project's `shared/config/lang.php` already has the new shape. For the DeepL and Google Translate sections, see [Translate with DeepL or Google Translate](packages/lang/usage.md#translate-with-deepl-or-google-translate).

### 10. Check the upgrade

Update the dependencies and run the checks you already use:

```bash
composer update
vendor/bin/phpunit
composer phpstan
```

Then look for the names this guide replaced. Each hit is a section above:

```bash
grep -rnF -e 'hook(' -e 'Quantum\Loader' -e 'BootPipeline' -e 'BootStageInterface' \
  -e 'InitDebuggerStage' -e 'createApplication' -e '@OA\' shared modules helpers
```

Finally, smoke-test one web request and one `php qt` command, with `app.debug` on and off, and read your log for the deprecation warnings from [section 3](#3-deprecations-are-logged-not-thrown).

## Upgrading from 2.x to 3.0

This part summarizes the required changes when upgrading Quantum projects from 2.x to 3.0.

### 1. Platform Requirements

- Minimum PHP version is now `8.0`.
- PHP `7.4` and older are no longer supported.

If you are upgrading an early 3.0 project, re-check your runtime before troubleshooting application code. The current framework and starter project both target the PHP 8 runtime line.

### 1.1 Notes For 3.0.3

If you are already on an earlier `3.0.x` release and moving to `3.0.3`, the main upgrade checks are:

- verify the runtime is on PHP 8
- verify any Twig-based rendering setup still matches your installed Twig package, because Twig is now treated as an optional renderer dependency
- re-check local and CI environments if they were previously pinned around the older PHP 7.4 baseline

### 2. Route and Middleware Response Contract

3.0 enforces explicit `Quantum\Http\Response` returns.

- Route handlers must return `Response`.
- Middleware `apply()` must return `Response`.
- `redirect()` and `redirectWith()` now return `Response` and should be returned by caller.

Before:

```php
$route->get('home', function ($response) {
    $response->html('ok');
});
```

After:

```php
$route->get('home', function (): Quantum\Http\Response {
    return response()->html('ok');
});
```

### 3. Request and Response Access

`Request` and `Response` are now instance-based in runtime flow.

- Use `request()` and `response()` helpers.
- Remove assumptions based on static facade behavior.

### 4. Dependency Injection Is Stricter

- `Di::get()` no longer auto-registers dependencies.
- Dependencies must be explicitly registered before retrieval.

Typical pattern:

```php
if (!Di::isRegistered(SomeService::class)) {
    Di::register(SomeService::class);
}

$service = Di::get(SomeService::class);
```

### 5. Renamed Base Classes

Update references:

- `Quantum\Service\QtService` -> `Quantum\Service\Service`
- `Quantum\Middleware\QtMiddleware` -> `Quantum\Middleware\Middleware`
- `Quantum\Migration\QtMigration` -> `Quantum\Migration\Migration`
- `Quantum\Console\QtCommand` -> `Quantum\Console\CliCommand`

### 6. Environment API Changes

- `Environment` is no longer a static singleton.
- Use `environment()` helper and methods like `isProduction()`, `isTesting()`, `isStaging()`, `isDevelopment()`, `isLocal()`.

### 7. Model and DB Behavior Updates

- `DbModel` fetch methods now return new model instances instead of mutating current model.
- `create()` resets model state before insert flows.
- DB-generated primary keys are synced back after save.

### 8. Router and Execution Changes

- Middleware ordering is prepend-based (later middleware wraps earlier).
- Route name uniqueness is validated at build time.
- Legacy implicit controller resolution paths were removed.

### 9. Upgrade Verification Checklist

After code changes, run:

```bash
vendor/bin/phpunit
composer phpstan
composer cs:check
```

Then smoke-test:

- Authentication routes
- Redirect/error flows
- Middleware validation branches
- Pagination and model fetch flows
