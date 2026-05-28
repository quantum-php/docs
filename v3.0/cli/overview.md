# CLI Overview

The Quantum PHP Framework includes a command-line tool that helps you work faster during development.

If the web layer is how users interact with your app, the CLI is how you interact with the framework itself.

## Why the CLI matters

The CLI often looks optional at first.
In practice, it becomes part of the normal workflow very quickly.

You use it to:

- start the local development server
- inspect project behavior
- generate application files
- work with modules
- speed up repetitive setup tasks

That means the CLI is not only a convenience. It is part of the developer experience.

## Core idea

Think of the Quantum CLI as your project assistant.

Instead of manually wiring every repetitive piece by hand, you can ask the framework to:

- serve the app
- generate boilerplate
- inspect routes
- scaffold new modules or features

This keeps your workflow consistent and reduces setup mistakes.

## Common use cases

The first commands most developers care about are usually:

### Start the development server

```bash
php qt serve
```

This runs the local development server so you can open the project in your browser.

### Generate app structure faster

Quantum provides generation commands that can create common files and folders for you.

Depending on your project type, this may include things like:

- modules
- controllers
- middlewares
- other framework-aligned structure

### Inspect registered routes

In larger apps, route inspection becomes useful quickly.

A route-listing command helps you understand:

- which URLs exist
- which controllers handle them
- what middleware is attached

That is especially helpful when debugging or onboarding into an older project.

## Why it helps to learn the CLI early

There are two big reasons.

### 1. It teaches the framework's intended workflow
When a framework ships CLI commands, those commands usually reflect how the framework expects developers to work.

### 2. It reduces manual repetition
You can always create files and folders manually, but the CLI helps you stay aligned with the framework's conventions.

That becomes more valuable as the project grows.

## CLI and modules work well together

In the Quantum PHP Framework, modules are an important organizational feature.

The CLI supports that model by helping generate or inspect module-oriented code structure.

That means the CLI is not a separate side tool. It supports the same architecture the rest of the framework encourages.

## What to expect from CLI docs

The CLI section of the docs should help you answer questions like:

- how do I run the app locally?
- how do I inspect routes?
- how do I generate modules and framework files?
- which commands should you learn first?

This page is the entry point for that part of the documentation.

## What to read next

After this page, continue with:

1. [Development Server](development-server.md)
2. [Code Generation](code-generation.md)

Those two topics cover the most common early workflow first.
