# Configuration

## Overview

The Quantum PHP Framework provides a powerful and flexible Configuration system that manages application settings across different environments and modules.

The configuration system loads, merges, and manages settings using a layered approach with support for environment overrides, file imports, and dot-notation access.

## Key Features

- Centralized storage of all configuration data using a dot-accessible data container.
- Loading and importing config files with collision detection.
- Access, set, remove, and flush config values at runtime.
- Support for environment-specific configurations.
- Integration with Quantum's Dependency Injection (DI) container for loading.

## Configuration Loading

Configurations are loaded via `Quantum\Loader\Loader` based on a `Setup` descriptor that describes which files and environment apply.
The `Config` class manages this process and the in-memory data structure.

## API Methods

- `load(Setup $setup)`: Load all configuration files.
- `import(Setup $setup)`: Import additional config files. 
  - *Note:* The `filename` defined in the `Setup` object is strictly used as the top-level key for the imported data. `Config::import()` always structures imported data as `[$fileName => $data]`. Empty or `null` filenames are not supported and will result in implicit namespacing under an empty or null key; always provide a unique, non-empty filename to ensure proper access and collision detection.
- `get(string $key, $default = null)`: Retrieve a config value.
- `has(string $key)`: Check if config key exists.
- `set(string $key, $value)`: Set or overwrite config value.
- `delete(string $key)`: Remove a config key.
- `flush()`: Clear all loaded config data.
- `all()`: Retrieve all configs as dot-accessible object.

## Environment Support

Configurations can be environment-specific by loading different files or values based on environment variables.

## Usage Examples

```php
// Retrieve a config value
$appName = config()->get('app.name', 'Quantum Application');

// Set a config value at runtime
config()->set('mailer.smtp.host', 'smtp.example.com');

// Check if config key exists
if (config()->has('database.default')) {
    // Do something
}
```

Other framework components frequently use the config system to determine behavior, such as routing prefixes, mail settings, logging verbosity, caching backends, and more.

## Best Practices

- Organize config files per module for maintainability.
- Use environment overrides to separate dev, staging, and production configurations.
- Avoid hardcoding values in code; prefer config injection.
- When using `import()`, always provide a unique, non-empty filename in `Setup` to ensure data is correctly accessible and to prevent naming collisions. `Config::import()` wraps the imported payload in the form `[$fileName => $data]`.

```php
// Guardrail example for safe import
$setup = new Setup('path/to/config', 'unique_filename');

config()->import($setup);
```

## Config Setup

The `Quantum\Loader\Setup` class acts as a descriptor for file loading.

- **Module Defaulting**: When the `Setup` constructor is called without specifying a `module`, it implicitly defaults to `request()->getCurrentModule()`.
  *Note:* In CLI or custom non-web contexts, this behavior may resolve configuration unexpectedly based on the current request state. For deterministic results, it is recommended to pass the `module` explicitly to the `Setup` constructor.

### Path Resolution Table

When loading configurations, the framework resolves file locations using the following hierarchy:

| Lookup Priority | Path Resolution Logic | Casing Behavior |
| :--- | :--- | :--- |
| **1. Module Path** | `modules/{module}/{pathPrefix}/{fileName}.php` | Preserves case |
| **2. Shared Fallback** | `shared/{lower(pathPrefix)}/{fileName}.php` | `pathPrefix` is forced to lowercase |

*Note: The shared fallback only triggers if `hierarchical` is set to `true` in the `Setup` instance.*

## What to read next

After configuration fundamentals, continue with:

- [Environment](environment.md)
- [Dependency Injection](dependency-injection.md)
- [Modules](../core-concepts/modules.md)


