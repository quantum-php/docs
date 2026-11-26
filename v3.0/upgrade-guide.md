# Upgrade Guide

This guide summarizes the changes to make when you upgrade a Quantum project. It has three parts: [3.1 to 3.2](#upgrading-from-31-to-32), [3.0 to 3.1](#upgrading-from-30-to-31) and [2.x to 3.0](#upgrading-from-2x-to-30).

## Upgrading from 3.1 to 3.2

3.2 raises the PHP minimum to 8.2 and moves the dependencies to their newest versions that run on it. Most applications only update `composer.json`; the sections below say where code or setup needs a change.

### 1. Platform and dependencies

**PHP 8.2 or newer.** An application on PHP 8.1 stays on 3.1.x. Check `php -v`, the `php` constraint in your `composer.json` (`^8.2`) and the PHP versions your CI runs.

**The `gd` extension.** `gumlet/php-image-resize` 3, which `UploadedFile::modify()` uses, requires `ext-gd`, so Composer refuses to install the framework without it. `UploadedFile::modify()` itself works as before.

**Your `composer.json`.** Require the framework with `"quantum/framework": "^3.2.0"`. A project created from the starter project also requires `symfony/process` and `symfony/yaml`: raise both to `^7.4`, because the framework's `symfony/console` 7.4 refuses `symfony/process` below 6.4 and Composer reports a conflict.

```json
"require": {
    "php": "^8.2",
    "quantum/framework": "^3.2.0",
    "symfony/process": "^7.4",
    "symfony/yaml": "^7.4"
}
```

**Newer majors.** The framework requires `psr/log` 3, `firebase/php-jwt` 7 and the Symfony 7.4 line of `symfony/console`, `symfony/var-dumper` and `symfony/var-exporter`. If your `composer.json` pins one of them to an older major, for example `psr/log` `^2.0`, allow the newer one. Commands that extend `Quantum\Console\CliCommand` already have the signatures Symfony 7 expects.

**No action needed:** `Pipeline`, `MatchedRoute` and `RouteFinder` are `readonly` classes now; they are `final`, so nothing extends them.

### 2. The JWT key must be long enough

`firebase/php-jwt` 7 rejects a signing key that is shorter than the algorithm's hash: 32 bytes for `HS256`, the default of `Quantum\Jwt\JwtToken`. The JWT authentication signs with `APP_KEY`, so with a shorter key every sign-in fails with `Provided key is too short`.

Check the length of your `APP_KEY`. If it has fewer than 32 characters, generate a new one:

```bash
php qt core:key
```

The command asks before it replaces an existing key. Tokens issued with the old key no longer verify, so API clients must sign in again. See the [JWT overview](packages/jwt/overview.md) for the lengths of the other algorithms.

### 3. Cache keys are typed

The cache adapters implement `psr/simple-cache` 3 and declare its types, for example `get(string $key, mixed $default = null): mixed`.

- A key passed to `get()`, `set()`, `has()` or `delete()` must be a string: `cache()->get(42)` throws a `TypeError`, so write `cache()->get('42')`.
- `getMultiple()`, `setMultiple()` and `deleteMultiple()` accept any iterable, not only an array. They still accept numeric keys, and throw `Quantum\Cache\Exceptions\InvalidCacheKeyException` for a key that is neither a string nor an integer.
- A cache adapter of your own that implements `Psr\SimpleCache\CacheInterface`, or a class that extends one of the built-in adapters and overrides these methods, must declare the same types.

See the [cache contracts](packages/cache/contracts.md#key-contract) for the details.

### 4. Register console commands with `addCommand()`

Symfony 7.4 deprecates `Application::add()`, and the framework registers its commands with `Application::addCommand()`. Commands you register through the framework need no change. Code of your own that calls `add()` on the Symfony application logs a deprecation; switch it to `addCommand()`:

```php
// before: $application->add($command);
$application->addCommand($command);
```

### 5. Publish the debug toolbar files again

`php-debugbar/php-debugbar` 3 moved its browser files, and the toolbar loads the bundled `dist/debugbar.min.css` and `dist/debugbar.min.js`. A project that published the 2.x files shows the toolbar without its styles and scripts until you run:

```bash
php qt install:debugbar
```

The command copies the new files over the old ones and keeps your own files, such as `custom_debugbar.css`. See [`install:debugbar`](packages/console/built-in-commands.md#installdebugbar).

### 6. OpenAPI generation

`zircote/swagger-php` 7 removed the static `OpenApi\Generator::scan()`. `php qt install:openapi` needs no change, and the generated `spec.json` is the same. Code of your own that builds a spec calls the generator instead:

```php
use OpenApi\Generator;

$openApi = (new Generator())->generate([$path]);
```

### 7. Tests in a project created from the starter project

The starter project's tests run on PHPUnit 11.5. If your project keeps them, require `"phpunit/phpunit": "^11.5"` and `"mockery/mockery": "^1.6"` in `require-dev`, then:

- remove the `verbose="true"` attribute from `phpunit.xml`; PHPUnit 11 no longer knows it and reports the file as a deprecated configuration
- add a `<source>` section to `phpunit.xml` if you collect code coverage (`composer test` does); without it PHPUnit 11 does not process coverage and fails the run:

```xml
<source>
    <include>
        <directory suffix=".php">./shared</directory>
    </include>
</source>
```

- replace `@dataProvider` doc comments with the `#[DataProvider('...')]` attribute (`use PHPUnit\Framework\Attributes\DataProvider;`); PHPUnit 12 no longer reads doc comments.

### 8. Log lines carry the context

The `single` and `daily` log adapters write the context of a log call after the message, as one line of JSON; they ignored it before:

```text
[2026-11-23 14:02:11] Info: Order paid {"order":1042}
```

- A line without a context is unchanged. A tool that parses your log lines with a fixed pattern must allow the JSON at the end.
- Everything you pass in the context reaches the log file: check your log calls for passwords, tokens or full request payloads.
- The message stays text: `logger()->info([...])` throws a `TypeError`, as in 3.1. Put structured data in the context.
- A log adapter of your own that uses `Quantum\Logger\Traits\LoggerTrait` and passes an array to `formatMessage()` gets a `TypeError`: pass a string.

See [File output format](packages/logger/adapters.md#file-output-format).

### 9. `Setup` takes the module as its third argument

The hierarchy flag of `Quantum\Config\Setup`, deprecated in 3.1.2, is removed: the `$hierarchical` constructor argument, `setHierarchy()` and `getHierarchy()`. A module's config file that does not exist always falls back to `shared/config`.

The constructor is now `Setup($pathPrefix, $fileName, $module, $exceptionMessage)`, so the module and the exception message move up one position. Name the module instead of passing the flag:

```php
// before
new Setup('config', 'app', true, 'Admin');

// after
new Setup('config', 'app', module: 'Admin');
```

An old call does not always fail. In a file that declares `strict_types`, it throws a `TypeError`. Without it, PHP turns `true` into the module `1` and `false` into no module, which means the current request's module, and the module name becomes the exception message, so the config is read from `shared` or from the wrong module. Calls that pass only the first two arguments, or the module as a named argument, need no change.

### 10. Config readers and adapter settings

**`getBool()` and `getInt()` without a default require the key.** A key that is missing, `null` or empty text (such as `MAIL_PORT=` in `.env`) throws `ConfigException::missingKey()`; it gave `false` or `0`. Pass a default where a key is optional:

```php
// before
$beta = config()->getBool('features.beta');

// after
$beta = config()->getBool('features.beta', false);
```

The exact rules are in the [typed reader contract](packages/config/contracts.md#typed-reader-contract).

**`config()->all()` returns an array,** a copy, and `[]` when the config is empty. Code that called methods on the result, such as `config()->all()->get('app.name')`, uses `config()->get('app.name')`, and a check for `null` checks for `[]`.

**Adapters receive a `ConfigSection`.** The framework's factories pass it for you. Code that builds an adapter itself wraps its array:

```php
use Quantum\Config\ConfigSection;

// before: new RedisAdapter(['host' => '127.0.0.1', 'port' => 6379, 'ttl' => 60, 'prefix' => 'app']);
$cache = new RedisAdapter(new ConfigSection(['host' => '127.0.0.1', 'port' => 6379, 'ttl' => 60, 'prefix' => 'app']));
```

Ports, TTLs and lifetimes are read as whole numbers, so a typo such as `abc` now throws instead of becoming `0`, and a missing cache or rate limit `ttl` or `port` throws when the adapter is built. The auth adapters require their config again and read `two_fa`, `otp_expires` and `session.remember_lifetime` when they are built.

**Code of your own that uses the framework's traits:**

- `Quantum\Config\Traits\ValueTrait` is renamed `WriteTrait` and keeps `set()`, `delete()` and `flush()`; reading moved to `ReadTrait`. `ConfigFileTrait` is removed, its code is part of `Config`.
- A class that implements `ConfigInterface` adds `section(string $key): ConfigSection` and returns an array from `all()`.
- A log adapter that uses `LoggerTrait` declares `initialize(ConfigSection $config)`.
- An auth adapter that uses `AuthTrait` implements `readConfig(ConfigSection $config)`, see [When the settings are read](packages/auth/adapters.md#when-the-settings-are-read).

### 11. Empty `.env` values and the Environment traits

**An empty `.env` value gives the default.** `env_bool()` and `env_int()`, and `environment()->getBool()` and `getInt()`, treat `KEY=` and a `KEY` line without `=` as not set, the same as a missing key. `env_bool()` gave `false` and `env_int()` threw an `EnvException`. So a setting whose default is on, and whose line is empty, is now on. The auth config of the `DemoWeb` and `DemoApi` module templates reads `env_bool('TWO_FA', true)`, so an empty `TWO_FA=` leaves two-factor authentication on. Write the value you mean:

```bash
# before: turned two-factor authentication off
TWO_FA=

# after
TWO_FA=false
```

`env()` still returns the raw value. The config readers stay strict on purpose, see the [`.env` readers](packages/environment/contracts.md#typed-reader-contract).

**`updateRow()` finds the line as the file writes it,** quoted or without a value, and keeps a comment after the value, so `php qt core:key` now also replaces a quoted `APP_KEY="..."`. The forms it finds are listed under [Mutation model](packages/environment/architecture.md#mutation-model).

**Code of your own that uses the Environment traits:** `Quantum\Environment\Traits\ValueTrait` is renamed `ReadTrait`, `EnvFileTrait` is removed, and `updateRow()` is in the new `WriteTrait`. A class that uses them declares what they use, as `Environment` does: the properties `$loaded`, `$envContent`, `$isMutable` and `$appEnv`, and the methods `getEnvFilePath()` and `getEnvFileName()`.

### 12. Check the upgrade

Update the dependencies and run the checks you already use:

```bash
composer update
vendor/bin/phpunit
composer phpstan
```

Then look for the names this part replaced. Each hit is a section above:

```bash
grep -rnF -e 'Generator::scan(' -e '@dataProvider' -e 'verbose=' -e 'setHierarchy(' -e 'getHierarchy(' -e 'Config\Traits\ValueTrait' -e 'ConfigFileTrait' -e '->all()->' -e 'Environment\Traits\ValueTrait' -e 'EnvFileTrait' shared modules helpers tests phpunit.xml
grep -rnE "new Setup\([^,]+,[^,]+, *(true|false)" shared modules helpers tests
grep -rnE -e "->(getBool|getInt)\('[^']+'\)" shared modules helpers tests
grep -nE '^[A-Z0-9_]+= *$' .env
```

The last command lists the empty values in `.env`. A hit matters only when the key is read with `env_bool()` or `env_int()` and a default.

Finally, open a page with `app.debug` on to check the toolbar, sign in once if you use JWT, and run one `php qt` command.

## Upgrading from 3.0 to 3.1

3.1 raises the PHP minimum, moves some dependencies to newer lines and reworks parts of the internals. Each section below says what changed, what to do about it, and where no action is needed.

### 1. Platform and dependencies

**PHP 8.1 or newer.** An application on PHP 8.0 stays on 3.0.x. Check `php -v`, the `php` constraint in your `composer.json` (`^8.1`) and the PHP versions your CI runs.

**Symfony 6.4.** `symfony/console`, `symfony/var-dumper` and `symfony/var-exporter` are on the `^6.4` line. Commands that extend `Quantum\Console\CliCommand` need no change. A class in your application that extends a Symfony class directly may need Symfony 6's stricter return types.

**`psr/log` 2 or 3.** The framework accepts both, so an application that uses `psr/log` 3 (for example through Monolog 3) can now install it. The nine PSR-3 methods of `Quantum\Logger\Logger` declare `string|Stringable $message`. A class that extends `Logger` and overrides them needs no change when its parameter has no type or is `string|Stringable`. PHP rejects an override that narrows the type, for example to `string`, and it did before as well.

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

**Custom stages.** A stage implements `StageInterface` and names the context it works with in its class docblock. The type is checked by PHPStan only, so the method signature stays the same. `MyStage` stands for a stage of your own:

```php
// before
class MyStage implements BootStageInterface
{
    public function process(AppContext $context): void
    {
        // ...
    }
}

(new BootPipeline([new MyStage()]))->run($context);

// after
/**
 * @implements StageInterface<AppContext>
 */
class MyStage implements StageInterface
{
    public function process(AppContext $context): void
    {
        // ...
    }
}

(new Pipeline([new MyStage()]))->run($context);
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

### 10. Redirect back with `back()`

3.1.1 adds `back()`, which sends the visitor back to the page they came from. Nothing breaks and there is nothing to change. Where your code writes `redirect(get_referrer() ?? base_url())`, you can use `back()` instead: it also refuses a referrer from another site. Modules generated from 3.1.1 use it; modules you generated before keep their code.

See [Redirecting back](packages/http/response.md#redirecting-back).

### 11. Constant classes became enums

3.1.1 turns six constant classes into PHP enums: `ReservedKeys`, `AuthKeys`, `Pagination` and, in `Quantum\Database\Enums`, `Type`, `Key` and `Relation`. The table actions of `Table` move to a new `TableAction` enum. **This is a breaking change.** An application that only writes `Relation::BELONGS_TO`, `Type::INT` or `Key::INDEX` keeps working, because the case names and values are the same. Code that treats these names as plain text needs a small change.

An enum case is not its value. Where you need the text, read `->value`, and where text comes from outside, turn it into a case with `from()` or `tryFrom()`:

```php
$schema[AuthKeys::USERNAME->value];

$relation = Relation::tryFrom('hasOne');
```

What to check:

- **A case used as an array key, compared with text, or passed to a `string` parameter** needs `->value`. Code that reads the constants of `AuthKeys` with `ReflectionClass::getConstants()` uses `AuthKeys::cases()`.
- **`Table::setAction()` and `Table::addIndex()`** take only the enum, `TableAction` and `Key`. A number or text such as `addIndex('name', 'unique')` throws a `TypeError`; write `Key::UNIQUE`.
- **`Table::CREATE`, `Table::ALTER`, `Table::DROP` and `Table::RENAME`** are removed. Use `TableAction::CREATE`, `TableAction::ALTER`, `TableAction::DROP` and `TableAction::RENAME`, see [Supported table actions](packages/database/schema-builder.md#supported-table-actions).
- **The `type` of a model relation** must be a `Relation` case. `'type' => 'hasOne'` is rejected, see [the relation type contract](packages/model/contracts.md#the-relation-type-is-a-relation-case).
- **Column types need no change.** `addColumn()`, `modifyColumn()` and `Column` accept a `Type` case or the type as text, so `Type::INT` and `'integer'` both work, see [Column types](packages/database/schema-builder.md#column-types).
- **`Pagination`** keeps its four names (`PAGINATION_CLASS`, `PAGINATION_CLASS_ACTIVE`, `PER_PAGE`, `PAGE`), read with `->value`, for example `Pagination::PER_PAGE->value`. The numbers `FIRST_PAGE_NUMBER`, `MINIMUM_PAGE_ITEMS_COUNT` and `EDGE_PADDING` moved to `PaginationLimit`, where they are constants read without `->value`.
- **A subclass** that overrides `Table::setAction()` or `Table::addIndex()` must declare the enum types, and one that overrides `Table::addColumn()`, `Table::modifyColumn()` or the `Column` constructor must declare `Type|string`.

The adapter types, `StatusCode`, `ContentType`, `Env` and `ExitCode` stay constant classes.

### 12. Typed `.env` and config values

Everything in `.env` is text, so `'debug' => env('DEBUG', true)` stores the string `'false'` when `.env` says `DEBUG=false`. 3.1.2 adds readers that convert the value where you read it: `env_bool()` and `env_int()` for `.env`, and `config()->getBool()` and `config()->getInt()` for config values. Your config keeps working without them; use them in new config files. See [Reading booleans and numbers](packages/environment/usage.md#reading-booleans-and-numbers) for `.env` and [the same section for config](packages/config/usage.md#reading-booleans-and-numbers).

The framework itself now reads its own settings this way, which changes two cases:

- **A whole-number setting that is not a whole number throws.** `view_cache.ttl`, `mailer.transport_log_limit`, `lang.url_segment` and `logging.message.limit` used to turn text such as `abc` into `0`; now they throw a `ConfigException`. Fix the value in your config or `.env`.
- **A setting set to `null` gets its default.** `app.debug`, `resource_cache`, `view_cache.ttl`, `view_cache.minify`, `mailer.mail_trap`, `mailer.transport_log_limit`, `lang.url_segment` and `logging.message.limit` read `null` as missing, where it used to mean `0` or `false`.

The 3.1.2 starter project reads `debug`, `resource_cache` and the SMTP and Redis ports with `env_bool()` and `env_int()`. If you copy those lines into your project, `env_int()` rejects an empty value, so a `.env` with `MAIL_PORT=` empty throws when the mailer config loads: set it to a number, for example `MAIL_PORT=25`.

### 13. The hierarchy flag of `Setup` is deprecated

`Quantum\Config\Setup` always looks for a module's config file first and then falls back to `shared/config`. Turning that fallback off is deprecated and will be removed in 3.2.0: passing the third argument, `$hierarchical`, to the constructor, and calling `setHierarchy()`, raise `E_USER_DEPRECATED`, which is logged as described in [section 3](#3-deprecations-are-logged-not-thrown). Nothing changes in behavior.

If you passed the argument only to reach the `module` argument after it, name the module instead:

```php
// before
new Setup('config', 'app', true, 'Admin');

// after
new Setup('config', 'app', module: 'Admin');
```

See [Config Setup](advanced-features/configuration.md#config-setup).

### 14. `cacheable()` takes effect

`cacheable()` on a route or a group had no effect in 3.0 and 3.1.1: only the global `resource_cache` switch decided whether a page was cached. From 3.1.2 the route setting wins for its route. If your routes already call `cacheable()`, check that you still want it: `cacheable(true)` now caches the page even when `resource_cache` is off, and its TTL replaces `view_cache.ttl`. See [Per-route caching](packages/resourcecache/overview.md#per-route-caching).

### 15. Other changes in 3.1.2

- **Modules generated from 3.1.2 need the 3.1.2 starter project files.** The `DemoWeb` and `DemoApi` templates read their texts from topic files such as `auth.php` and `posts.php` in `shared/resources/lang/<lang>`, not only from `common.php`, and their config uses `env_bool()` and `env_int()`. Copy the lang files from the 3.1.2 starter project before you generate one of these modules. Modules you generated before keep their code and keep working.
- **A class that extends `LocalFileSystemAdapter` and overrides `glob()`** must declare its return type, `array|false`.
- **New:** `RouteBuilder::patch()` declares a `PATCH` route, next to `get()`, `post()`, `put()` and `delete()`. Nothing to change.

### 16. Check the upgrade

Update the dependencies and run the checks you already use:

```bash
composer update
vendor/bin/phpunit
composer phpstan
```

Then look for the names this guide replaced. Each hit is a section above:

```bash
grep -rnF -e 'hook(' -e 'Quantum\Loader' -e 'BootPipeline' -e 'BootStageInterface' \
  -e 'InitDebuggerStage' -e 'createApplication' -e '@OA\' \
  -e 'Table::CREATE' -e 'Table::ALTER' -e 'Table::DROP' -e 'Table::RENAME' \
  -e 'setHierarchy(' -e 'cacheable(' shared modules helpers
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

Typical pattern, where `SomeService` stands for a service of your own:

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
