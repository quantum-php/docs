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

Practical note: current project dependencies are Composer-platform-checked for the PHP 8 runtime line. A PHP 7.4 environment will fail before the project boots.

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


2.  **Navigate into the project directory**\


    ```
    cd my-project
    ```


3.  **Start the development server**

    ```bash
    php qt serve
    ```


    A built-in server will launch (typically at `http://localhost:8000/`)

### Verification

You should now see a working Quantum demo application in the browser.

On a successful fresh install, you should also expect that:

- `.env` already exists
- `APP_KEY` has been generated
- the starter demo modules are already installed
- the CLI can boot successfully with `php qt serve`
