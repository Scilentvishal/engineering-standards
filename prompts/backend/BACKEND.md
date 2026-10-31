# Backend Engineering Standards

## 1. Core Principles
- **Predictable Service Boundaries**: Ensure distinct architectural layers with strict separation of responsibilities.
- **Fail Safe & Secure by Default**: Deny access by default, validate all untrusted inputs at boundary controllers, and escape outgoing database queries.
- **Stateless Application Tier**: Keep application nodes stateless to allow horizontal auto-scaling; persist sessions, tokens, and ephemeral state in distributed stores like Redis or signed tokens.

## 2. Robust Reliability
- Implement grace periods for process termination (`SIGTERM`/`SIGINT`), draining in-flight requests and closing database pools cleanly.
- Set explicit timeouts on all outbound HTTP calls, database operations, and external cache accesses to prevent connection exhaustion.

