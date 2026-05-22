# Storage Architecture

Storage has two runtime paths: filesystem access and upload persistence.

## Filesystem access flow

1. `fs()` calls `FileSystemFactory::get()`
2. config is imported if needed
3. requested adapter (or `fs.default`) is resolved
4. adapter is wrapped in `FileSystem`
5. wrapper is cached per adapter name in the process

Practical effect: repeated `fs('local')` calls reuse the same wrapper instance.

## Wrapper model

`FileSystem` is a delegating wrapper around one adapter.

Unsupported adapter methods are rejected with exceptions instead of being ignored.

## Upload flow

`UploadedFile` runs this sequence:

1. parse upload metadata
2. detect extension + MIME from local temp file
3. load MIME policy (defaults + optional config)
4. validate upload and destination
5. write locally or through remote adapter
6. optionally run post-save image modification

## Cloud composition

Cloud backends are composed from:

- adapter implementation
- cloud app/token service wiring from config

This keeps app-level usage consistent (`fs()` + wrapper API) while backend auth/token lifecycle stays in services/config.
