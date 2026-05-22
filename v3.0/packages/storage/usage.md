# Using Storage

Use `fs()` for filesystem operations and `UploadedFile` for request uploads.

## Work with local files

```php
$path = storage_dir() . '/exports/users.json';

fs('local')->put($path, json_encode($users));

if (fs('local')->exists($path)) {
    $json = fs('local')->get($path);
}
```

## Switch adapters only when needed

```php
$reports = fs();           // fs.default
$backup = fs('dropbox');
$archive = fs('gdrive');
```

Most apps should configure one default and avoid backend switching in core flows.

## Save an uploaded file locally

```php
$uploadedFile = new UploadedFile($_FILES['avatar']);
$uploadedFile->setName('profile-photo');
$uploadedFile->save(uploads_dir() . '/users');
```

To allow overwrite:

```php
$uploadedFile->save(uploads_dir() . '/users', true);
```

## Extend allowed MIME types

```php
$uploadedFile->setAllowedMimeTypes([
    'image/webp' => ['webp'],
]);
```

Use `merge: false` to replace the policy instead of extending it.

## Save uploads to a remote adapter

```php
$uploadedFile = new UploadedFile($_FILES['report']);
$uploadedFile->setRemoteFileSystem(fs('dropbox')->getAdapter());
$uploadedFile->save('reports/2026');
```

## Modify images after save

```php
$uploadedFile = new UploadedFile($_FILES['photo']);
$uploadedFile
    ->modify('resizeToWidth', [600])
    ->save(uploads_dir() . '/photos');
```

## Common pitfalls

- Destination directory must exist and be writable for local saves.
- MIME and extension must match policy.
- `getDimensions()` is image-only and throws for invalid image files.
- Post-save image modifications are not ideal for direct cloud uploads.
