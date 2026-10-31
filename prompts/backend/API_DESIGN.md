# RESTful API Design Standards

## 1. Resource Modeling & URI Structure
- Use lowercase nouns in plural form for resource endpoints (e.g., `/api/v1/orders`, `/api/v1/users`).
- Nest sub-resources logically for parent-child relations (e.g., `/api/v1/users/{userId}/addresses`). Keep nesting depth to at most 2 levels; use query filters for deeper relations.

## 2. HTTP Methods & Idempotency
- `GET`: Safe and idempotent. Retrieve resource representation.
- `POST`: Non-idempotent. Create a new resource. Returns `201 Created` with `Location` header.
- `PUT`: Idempotent. Complete replacement of a resource.
- `PATCH`: Non-idempotent or idempotent partial update of specified fields.
- `DELETE`: Idempotent. Remove a resource. Returns `204 No Content` or `200 OK`.

## 3. Standard Response Envelope
All API endpoints must adhere to a consistent response format:
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 142
  }
}
```

Error responses:
```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "User with ID '123' does not exist",
    "details": []
  }
}
```

