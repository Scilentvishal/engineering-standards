# Authentication & Authorization Standards

## 1. Authentication
- Enforce secure password hashing using Argon2id or bcrypt (cost factor >= 12).
- Issue short-lived access tokens (15-30 minutes) and store long-lived refresh tokens securely with automatic rotation and family invalidation upon reuse detection.
- Store cookies with flags: `HttpOnly`, `Secure`, and `SameSite=Lax` or `SameSite=Strict`.

## 2. Authorization & Tenant Isolation
- Distinguish between **Authentication** ("Who are you?") and **Authorization** ("Do you have permission to perform this action on this resource?").
- Implement Role-Based Access Control (RBAC) or Attribute-Based Access Control (ABAC).
- Enforce strict tenant isolation: every query on multi-tenant systems must filter on `tenantId` at the repository query level, never relying solely on client input.

