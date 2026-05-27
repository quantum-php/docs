# Project Structure

One of the easiest ways to become comfortable with the Quantum PHP Framework is to understand how a real project is organized.

This page is based on the current `quantum/project` application skeleton, not a generic framework guess. The goal is to help readers build a practical understanding of the folders they will actually see in a new project.

## A high-level view

A typical Quantum PHP Framework project is organized around a few core areas:

- `public/` for the web entry point and public assets
- `shared/` for application-wide configuration, models, services, commands, and shared views/resources
- `migrations/` for database migrations
- `tests/` for automated tests
- `helpers/`, `hooks/`, and `libraries/` for supporting application behavior
- `qt` for command-line framework usage

This structure helps keep the public-facing web layer separate from shared application logic and supporting resources.

## Main folders in the project skeleton

### `public/`

This is the public web root of the application.

Notable contents include:

### `public/index.php`

This file is the main web entry point. It serves as a thin handoff to the framework's core bootstrap logic.

```php
require dirname(__DIR__) . '/vendor/autoload.php';

use Quantum\App\Factories\AppFactory;
use Quantum\App\Enums\AppType;

if (!defined('DS')) {
    define('DS', DIRECTORY_SEPARATOR);
}

AppFactory::create(AppType::WEB, dirname(__DIR__))->start();
```

It is important to note that this file is not where request lifecycle logic lives; that is handled within `AppFactory` and the `WebAppAdapter`.

- `public/assets/` for publicly served assets
- `public/uploads/` for uploaded files
- `public/.htaccess` for Apache-style web server configuration

If you are deploying a standard web application, this is the folder that will usually be exposed by the web server.

### `shared/`

This is one of the most important directories in the project. It contains shared application logic and framework-facing configuration.

In the current project skeleton, it includes areas such as:

- `shared/config/` for application configuration
- `shared/Commands/` for CLI command classes
- `shared/Models/` for application models
- `shared/Services/` for service-layer logic
- `shared/DTOs/` for data transfer objects
- `shared/Enums/` for enum definitions
- `shared/Transformers/` for transformation logic
- `shared/views/` for shared views
- `shared/resources/` for shared resources such as language files
- `shared/emails/` for email-related assets
- `shared/store/` for storage-related project data

If you are trying to understand the core behavior of a project, this is one of the first places to study.

### `migrations/`

This folder contains database migration files.

In the current skeleton, it already includes example migration files such as:

- `create_table_users_...php`
- `create_table_posts_...php`
- `create_table_comments_...php`

This gives a good early hint that the starter project is designed to demonstrate real application structure, not just a nearly empty shell.

### `tests/`

This folder contains automated tests.

The current skeleton includes:

- `tests/Feature/` for feature-level tests
- `tests/Unit/` for unit tests
- `tests/Helpers/` for test helpers
- `tests/bootstrap.php` for test bootstrap logic
- `tests/_root/` for test support fixtures and environment scaffolding

This is useful because it shows that testing is part of the project structure from the start.

### `helpers/`

This folder contains shared helper functions.

In the current skeleton, it includes:

- `helpers/functions.php`

This is typically where reusable procedural helpers can live when they do not naturally belong in a service or class.

### `hooks/`

The skeleton includes a `hooks/` directory, currently kept alive with a `.gitkeep` file.

This suggests the framework/project layout reserves a place for hook-based extensions or related project behavior, even if the demo project does not actively use it yet.

### `libraries/`

The project also includes a `libraries/` directory, currently empty except for `.gitkeep`.

This gives you a dedicated place for custom library-style code that does not fit cleanly into other project areas.

## Important root files

A few root-level files are worth recognizing early:

- `composer.json` for project dependencies and package metadata
- `.env.example` for environment setup guidance
- `qt` for command-line framework operations
- `phpunit.xml` for testing configuration
- `LICENSE`, `.gitignore`, and CI-related files for project maintenance

## A useful way to think about it

If you are new to the framework, this simplified model is enough to get started:

- `public/` = what the web server sees
- `shared/` = where most application-level code and config live
- `migrations/` = database schema changes
- `tests/` = automated test coverage
- `qt` = command-line entry for framework tooling

Once this mental map is clear, it becomes much easier to understand the next layers of the framework.

## What is not covered here yet

This page explains the project layout at a structural level, but it does not yet explain:

- how routing is configured
- how controllers are organized in practice
- how views are rendered
- how modules are structured when used in a larger application

Those topics should be covered in their own dedicated pages.

## What should you read next?

After this page, the best next topics are:

- [Routing](../core-concepts/routing.md)
- [Controllers](../core-concepts/controllers.md)
- [Views](../core-concepts/views.md)
- [Modules](../core-concepts/modules.md)
