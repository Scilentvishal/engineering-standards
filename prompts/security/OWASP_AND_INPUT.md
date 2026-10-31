# OWASP Standards & Injection Prevention

## 1. Input Sanitization & Boundary Validation
- Validate all incoming data at the system edge with strict, typed schemas.
- Reject any payload containing null bytes, path traversal sequences (`../`), or control characters in text fields.
- Restrict file upload paths using canonical normalization and containment assertions to prevent path traversal outside storage directories.

## 2. Token Security & Session Management
- Store JWTs in `HttpOnly`, `Secure`, `SameSite=Strict` cookies to block XSS extraction.
- Implement token revocation and short lifetimes (maximum 15 minutes for access tokens).
- Ensure logout endpoints invalidate active server-side sessions or blacklist refresh tokens in Redis.

