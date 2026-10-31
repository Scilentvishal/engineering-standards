# Backend Layered Architecture

## 1. Architectural Layers & Responsibilities

```
[ HTTP / Transport Layer ] -> Controllers
          ↓
[ Business Domain Layer ]  -> Services
          ↓
[ Persistence Layer ]     -> Repositories
          ↓
[ Database / Storage ]
```

### Controllers
- **Sole Responsibility**: Accept HTTP requests, parse and validate headers/params/body, pass typed DTOs to services, format domain responses into HTTP status codes and payloads.
- **Rule**: Controllers must never contain SQL queries, ORM calls, or raw business calculations.

### Services
- **Sole Responsibility**: Coordinate business use-cases, enforce authorization rules, orchestrate multi-step transactions, dispatch events.
- **Rule**: Services must be independent of HTTP concepts (`req`, `res`, cookies, status codes). They receive clean domain inputs and return domain results or throw domain exceptions.

### Repositories
- **Sole Responsibility**: Abstract database read and write operations behind clear typed interfaces.
- **Rule**: Repositories must never know about HTTP or outer business orchestration. They execute database queries, map records to domain models, and handle raw database errors.

