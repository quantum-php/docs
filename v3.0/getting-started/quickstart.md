# Quickstart

This quickstart is for developers who want to get the Quantum PHP Framework running quickly and understand the basic flow before diving deeper into the documentation.

## Before you begin

Make sure you have completed the [Installation](../installation.md) guide first.

## 1. Create a new project

Create a new project using Composer:

```bash
composer create-project quantum/project my-project
```

Then move into the project directory:

```bash
cd my-project
```

## 2. Start the development server

Run the built-in development command:

```bash
php qt serve
```

If everything is working correctly, the application should now be available in your browser at the local address shown by the command output.

## 3. Confirm the application is working

Open the local project URL in your browser.

If the installation was successful, you should see the default welcome page.

## 4. Understand the goal of this first run

At this point, the important thing is not to learn every framework feature at once.

The goal is simply to confirm three things:

- the framework is installed correctly
- the CLI tooling is working
- the project can run locally in a normal development workflow

## 5. Learn how the project is organized

Once the project is running, the next step is understanding where the main parts of the application live.

Continue with [Project Structure](project-structure.md) to get a clear overview of how a Quantum PHP Framework project is organized.

## 6. Suggested next steps

A good next path after this page is:

1. [Project Structure](project-structure.md)
2. [Routing](../core-concepts/routing.md)
3. [Controllers](../core-concepts/controllers.md)
4. [Views](../core-concepts/views.md)
5. [Modules](../core-concepts/modules.md)

This order helps you move from "the app runs" to "I understand how the framework is put together."
