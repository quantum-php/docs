# Storage

Storage gives Quantum a single API for local files, cloud-backed filesystems, and uploaded files.

Use it when you want one app-level interface for file operations across `local`, `dropbox`, and `gdrive`.

## What it provides

- `fs()` helper for filesystem access
- `FileSystem` wrapper around the selected adapter
- `UploadedFile` for upload validation and persistence
- adapter selection through `config/fs.php`

## Quick example

```php
fs()->put(storage_dir() . '/exports/users.json', json_encode($users));

if (fs()->exists(storage_dir() . '/exports/users.json')) {
    $json = fs()->get(storage_dir() . '/exports/users.json');
}
```

## Upload example

```php
$uploadedFile = new UploadedFile($_FILES['avatar']);
$uploadedFile->setName('profile-photo');
$uploadedFile->save(uploads_dir() . '/users');
```

## Operational constraints

- Unknown adapter names fail during resolution.
- Cloud adapters keep the same wrapper API, but backend semantics differ (especially naming vs ID-based access).
- `UploadedFile` validation depends on local temporary upload files.
- Image modifications are best for local saves.

