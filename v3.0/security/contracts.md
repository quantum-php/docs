# AuthService Contract

The `AuthServiceInterface` defines the main operations for handling user data in Quantum's authentication system. This interface outlines how user entities are created, updated, retrieved, and defined across the framework.

## Method Details

### `get(string $field, ?string $value): ?User`
- **Purpose**: Retrieve a user entity by a specified field and value.
- **Functionality**: Utilizes the `User` model to find a match. Returns `null` if no match is found.
- **Example Usage**: Used to locate a user by email during login authentication.

### `add(array $data): User`
- **Purpose**: Creates a new user within the system.
- **Functionality**: Initializes a new `User` entity, populates with provided data, and persists it. Automatically handles unique identifier generation.
- **Example Usage**: Engaged during user registration workflows.

### `update(string $field, ?string $value, array $data): ?User`
- **Purpose**: Updates existing user details based on a field match.
- **Functionality**: Finds the user, updates relevant fields, and re-saves the entry. Avoids altering primary identifiers.
- **Example Usage**: Allows updates to user profiles, such as changing contact information.

### `userSchema(): array`
- **Purpose**: Defines the structure and visibility of user-related data fields.
- **Functionality**: Provides a schema that specifies field names and their visibility, helping to structure user data consistently.
- **Example Usage**: Employed in form generation and validation scenarios, ensuring data integrity and security adherence.

This interface ensures that the authentication system can consistently interact with the `User` object and schema across different storage or service implementations.