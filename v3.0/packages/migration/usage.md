# Migration Usage

Most of the package is built around writing migration classes and then letting `MigrationManager` run them.

## Writing a migration

Create a class under your project's `migrations` directory and extend `Quantum\Migration\Migration`.

```php
use Quantum\Database\Enums\Type;
use Quantum\Database\Factories\TableFactory;
use Quantum\Migration\Migration;

class CreateTableUsers1710000000 extends Migration
{
    public function up(TableFactory $tableFactory): void
    {
        $table = $tableFactory->create('users');

        $table->addColumn('id', Type::INT, 11)->autoIncrement();
        $table->addColumn('email', Type::VARCHAR, 255)->unique();
        $table->addColumn('created_at', Type::TIMESTAMP)
            ->default('CURRENT_TIMESTAMP', false);
    }

    public function down(TableFactory $tableFactory): void
    {
        $tableFactory->drop('users');
    }
}
```

Use `create()` when the table does not exist yet, and `get()` when you want to alter an existing table.

## Generating a scaffold

```php
use Quantum\Migration\MigrationManager;

$manager = new MigrationManager();
$name = $manager->generateMigration('users', 'create');
```

This writes a file into `base_dir()/migrations` and returns the generated migration name.

Review the generated file before running it. Some templates intentionally leave work unfinished.

## Applying pending migrations

```php
use Quantum\Migration\MigrationManager;

$manager = new MigrationManager();
$applied = $manager->applyMigrations(MigrationManager::UPGRADE);
```

Upgrade mode applies every pending migration file that is not already recorded in the `migrations` table.

## Rolling migrations back

```php
use Quantum\Migration\MigrationManager;

$manager = new MigrationManager();
$rolledBack = $manager->applyMigrations(MigrationManager::DOWNGRADE, 1);
```

Passing `1` reverts the latest applied migration. Omitting the step argument makes the manager attempt to revert all recorded migrations.

## Practical guidance

- Keep one schema change per migration when possible.
- Finish generated rename and drop templates before running them.
- Make `down()` real whenever you expect to roll a migration back.
- Be careful with long sequences: the package does not wrap the full migration batch in its own transaction.
- Remember that this package relies on the relational `TableFactory` API, so use it with SQL drivers only.
