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

This flow is a natural fit for path-based adapters such as Dropbox. During the save, Quantum still reads the PHP temp file through the local adapter before it writes to the remote adapter, so keep the default `fs()` adapter on `local` for upload-heavy flows.

For Google Drive folder placement, use the filesystem adapter directly when you need to pass a parent folder ID:

```php
$uploadedFile = new UploadedFile($_FILES['report']);

fs('gdrive')->put(
    $uploadedFile->getNameWithExtension(),
    file_get_contents($uploadedFile->getPathname()),
    $folderId
);
```

`UploadedFile::save()` builds one destination string, while the Google Drive adapter accepts the parent folder as a separate argument.

## Modify images after save

```php
$uploadedFile = new UploadedFile($_FILES['photo']);
$uploadedFile
    ->modify('resizeToWidth', [600])
    ->save(uploads_dir() . '/photos');
```

## Common pitfalls

- Destination directory should already exist and be writable for local saves.
- MIME and extension should match the active upload policy.
- `getDimensions()` is image-focused and throws when the temp file is not a readable image.
- Post-save image modifications fit local destinations best, because the modifier runs against the saved path after persistence.
- In tests and CLI scripts, `save()` copies the source path into place when the file did not come through PHP's HTTP upload pipeline.
