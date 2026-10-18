# Installation

This guide walks you through installing and running a new Quantum PHP project.

### Requirements

Make sure your environment includes:

* **PHP 8.0+**;
* **PHP extensions**:
  * PDO
  * curl
  * JSON
  * simplexml
  * fileinfo
  * OpenSSL
  * bcmath
* **Composer** installed and accessible globally

Optional framework features may require additional extensions or packages such as `redis`, `memcached`, `zip`, `dom`, or `twig/twig`.

Practical note: run `php -v` to check your PHP version before you start. Quantum needs PHP 8.0 or newer.

### Installation Steps

1.  **Create a new project**

    ```bash
    composer create-project quantum/project my-project
    ```

    The current starter project runs a post-create setup sequence automatically after Composer finishes installing dependencies.

    That setup currently:

    - creates `.env` from `.env.example`
    - generates an application key
    - installs the demo `Web` and `Api` modules
    - installs OpenAPI assets/routes for the `Api` module
    - publishes DebugBar assets
    - prints the installed framework version


2.  **Navigate into the project directory**


    ```bash
    cd my-project
    ```


3.  **Start the development server**

    ```bash
    php qt serve
    ```


    The development server starts and prints its address, by default `http://127.0.0.1:8000/`. If port 8000 is busy, it uses the next free port. The options are described under [`serve`](packages/console/built-in-commands.md#serve).

### Verification

You should now see a working Quantum demo application in the browser.

On a successful fresh install, you should also expect that:

- `.env` already exists
- `APP_KEY` has been generated
- the starter demo modules are already installed
- the CLI can boot successfully with `php qt serve`
