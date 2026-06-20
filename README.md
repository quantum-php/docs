# Quantum PHP Framework Documentation

[![Quantum](https://quantumphp.io/assets/img/quantum-favicon.png)](https://quantumphp.io)

## Quantum PHP Framework

Quantum is a lightweight, high-performance PHP framework built with simplicity, modularity, and developer experience in mind. Designed for both beginners and professionals, it allows rapid development of web applications using a clean and expressive syntax.

[![](https://github.com/quantum-php/framework/actions/workflows/php.yml/badge.svg)](https://github.com/quantum-php/framework/actions/workflows/php.yml)[![](https://codecov.io/gh/quantum-php/framework/branch/master/graph/badge.svg)](https://codecov.io/gh/quantum-php/framework)[![](https://scrutinizer-ci.com/g/quantum-php/framework/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/quantum-php/framework)[![](https://img.shields.io/github/license/quantum-php/framework)](https://github.com/quantum-php/framework/blob/master/LICENSE)[![](https://img.shields.io/packagist/v/quantum/framework)](https://packagist.org/packages/quantum/framework)

***

## Welcome

This repository contains the official documentation for the **Quantum PHP Framework**.

The goal of this documentation is to help you move from first installation to a clear understanding of how the framework is structured, how its core pieces fit together, and how to build real applications with confidence.

If you are new to the framework, the best path is:

1. [What is Quantum PHP Framework?](v3.0/introduction/what-is-quantum.md)
2. [Why Quantum PHP Framework?](v3.0/introduction/why-quantum.md)
3. [Installation](v3.0/installation.md)
4. [Quickstart](v3.0/getting-started/quickstart.md)
5. [Project Structure](v3.0/getting-started/project-structure.md)

This path is designed for developers who want both a fast start and a clearer understanding of the framework.

***

### Overview

Quantum is a modern MVC/HMVC framework that provides the core tools needed to build scalable web applications. Whether you're building APIs, websites, or admin panels, Quantum gives you full control without unnecessary complexity.

***

### Features

* MVC & HMVC architecture
* Powerful routing with support for RESTful routes
* Built-in authentication & CSRF protection
* Modular structure with organized services and modules
* Environment-based configuration system
* Templating system with escaping and layout support
* File uploads, storage and file system abstraction
* Mailer integration
* Multiple database adapter support (Idiorm, SleekDB)
* Flexible caching system with multiple drivers (File, Database, Redis, Memcache)
* Simple and extendable testing setup
* Localization and translation support
* CLI tools for rapid scaffolding and dev tasks
* JWT support for APIs

***

### Modular by Design

Modules are fully isolated packages within the project (`/modules`) that can contain their own controllers, models, views, and routes. Great for building reusable features like blog, shop, dashboard, and other feature-focused application areas.

You can scaffold a demo module using:

```bash
php qt install:demo
```

If you want a deeper conceptual explanation of the framework itself, continue with [What is Quantum PHP Framework?](v3.0/introduction/what-is-quantum.md).

***

## Documentation focus

The current documentation effort is focused on building a strong foundation first.

That means the early priority is to make sure new developers can:

- install the framework
- run a project locally
- understand the project structure
- understand the role of routing, controllers, views, and modules
- develop a clear picture of how Quantum applications are organized

***

### Contributing

Contributions are welcome. If you have suggestions for improving the framework or its documentation, feel free to open an issue or submit a pull request.

***

### License

Quantum PHP Framework is open-source and licensed under the [MIT license](https://raw.githubusercontent.com/quantum-php/framework/refs/heads/master/LICENSE).
