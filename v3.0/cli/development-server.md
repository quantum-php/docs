# Development Server

One of the first CLI commands most developers use in the Quantum PHP Framework is the development server command.

It gives you a fast way to run the project locally and verify that your installation works.

## Starting the server

The basic command is:

```bash
php qt serve
```

This starts the local development server for your application.

Once the server starts, Quantum will show the local address where the app is available.

Open that address in your browser to test the project.

## Why this command matters

This command is important for more than just convenience.

It confirms several pieces of your environment at once:

- PHP is available
- the project is installed correctly
- the framework CLI is working
- the application can boot successfully

That makes it one of the fastest health checks for a new project.

## A practical workflow

A normal workflow looks like this:

1. install the project
2. move into the project directory
3. run `php qt serve`
4. open the local app URL in the browser
5. confirm the default app loads

This is usually the first real proof that the framework is running correctly.

## When to use the development server

Use the development server during normal local development, especially when you are:

- learning the framework
- testing routes and controllers
- working on views
- validating module structure
- doing quick checks after changes

It is the fastest feedback loop for day-to-day work.

## Why this is a good starting point

The built-in development command removes a lot of early friction.

Instead of forcing a full production-style stack immediately, it gives a simple entry point:

- install
- serve
- open the app
- start learning

That is a much smoother onboarding path.

## Common mistakes

### Running the command outside the project directory
If you are not inside the correct project folder, the command may fail or behave unexpectedly.

### Forgetting to finish installation first
If dependencies or setup steps are missing, the app may not boot correctly.

### Treating the development server like production infrastructure
This command is for local development. Production deployment should use a proper web server setup.

## What to do after the server works

Once you can run the development server successfully, the next good questions are:

- where are my routes defined?
- where do controllers live?
- how are views rendered?
- how are modules structured?

That is why the development server belongs near the beginning of the docs journey.

## What to read next

- [Quickstart](../getting-started/quickstart.md)
- [Project Structure](../getting-started/project-structure.md)
- [CLI Overview](overview.md)
