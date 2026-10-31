# Centralized Error Handling Standards

## 1. Domain Error Hierarchy
Create explicit domain error classes extending a base `AppError`:
- `AppError` (`message`, `statusCode`, `errorCode`, `isOperational`)
  - `ValidationError` (400)
  - `AuthenticationError` (401)
  - `ForbiddenError` (403)
  - `NotFoundError` (404)
  - `ConflictError` (409)

## 2. Centralized Error Middleware
- Unify exception handling in a single middleware / exception filter at the application root.
- Return structured error responses to clients, hiding stack traces and internal database errors in production.
- Distinguish operational errors (predictable client/system issues) from programmer errors (unhandled null pointers, syntax bugs).

