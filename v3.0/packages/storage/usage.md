# Using Storage

This package is usually used through `fs()` for filesystem work and `UploadedFile` for request uploads.

## Work with local files

```php
$path = storage_dir() . '/exports/users.json';

fs('local')->put($path, json_encode($users));

if (fs('local')->exists($path)) {
    $json = fs('local')->get($path);
}
```

Use the local adapter when you need path helpers or direct filesystem checks such as `isReadable()` or `glob()`.

## Switch adapters by use case

```php
$reports = fs();           // uses fs.default
$backup = fs('dropbox');
$archive = fs('gdrive');
```

Most application code should stick to one configured default. Pass explicit adapter names only when you genuinely need different backends in the same process.

## Save an uploaded file locally

```php
$uploadedFile = new UploadedFile($_FILES['avatar']);
$uploadedFile->setName('profile-photo');
$uploadedFile->save(uploads_dir() . '/users');
```

A successful local save requires all of the following:

- the upload completed without a PHP upload error
- the destination directory already exists
- the directory is writable
- the file extension and detected MIME type match the allowed policy
- the destination filename does not already exist unless you pass `true` as the second argument

```php
$uploadedFile->save(uploads_dir() . '/users', true); // allow overwrite
```

## Extend or replace the allowed MIME types

```php
$uploadedFile->setAllowedMimeTypes([
    'image/webp' => ['webp'],
]);
```

By default, that merges with the built-in map. Pass `merge: false` if you want a strict custom allow-list.

You can also define shared rules in `config/uploads.php` under `uploads.allowed_mime_types`.

## Save an uploaded file to a remote adapter

```php
$uploadedFile = new UploadedFile($_FILES['report']);
$uploadedFile->setRemoteFileSystem(fs('dropbox')->getAdapter());
$uploadedFile->save('reports/2026');
```

This keeps local validation of the temporary upload, then sends the final payload through the remote adapter.

For Google Drive, remember that later reads and updates are mostly ID-based even if the first `put()` call created the file by name.

## Modify an image after saving

```php
$uploadedFile = new UploadedFile($_FILES['photo']);
$uploadedFile
    ->modify('resizeToWidth', [600])
    ->save(uploads_dir() . '/photos');
```

`modify()` only works for image files and only for methods provided by `Gumlet\ImageResize`.

Practical caveat: the modification runs against the saved target path after storage, so it is best used for local saves. Direct remote uploads do not provide a local saved file path for that post-processing step.

## Check image metadata

```php
$uploadedFile = new UploadedFile($_FILES['photo']);

$mime = $uploadedFile->getMimeType();
$hash = $uploadedFile->getMd5();
$dimensions = $uploadedFile->getDimensions();
```

`getDimensions()` throws when the file is not a valid image, so use it only for image-oriented workflows.
