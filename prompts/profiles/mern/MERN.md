# MERN Stack Engineering Profile

## 1. Full-Stack Coordination (MongoDB + Express + React + Node)
- **Clear Boundary**: Decouple client (React) and server (Express/Node) into separate directory trees or workspaces (`apps/web`, `apps/api` or `client/`, `server/`).
- **Uniform API Contracts**: Share TypeScript types or schema definitions (e.g. Zod schemas) between React client and Express server to ensure contract synchronization.
- **Security Invariants**:
  - Secure CORS configuration permitting only the verified React client domain.
  - Store JWTs in secure, HTTP-only cookies, not `localStorage`.
- **Database Best Practices**:
  - Perform all data filtering, sorting, and pagination within MongoDB queries before returning results over HTTP.
  - Never load raw collections into Express to filter them in Node.js memory.

