# Express.js Engineering Profile

## 1. Modular Architecture
- Structure routes using `express.Router()` per resource (`/routes/user.routes.js`, `/routes/order.routes.js`).
- Never place business logic directly in route handler callbacks. Delegate immediately to Services.
- Always use asynchronous middleware error forwarding (`next(err)`) or native Express async error support (Express 5+).

## 2. Security & Middleware Configuration
- Enable `helmet` for secure HTTP headers.
- Enable `cors` with explicit origin whitelists, never wildcard `*` with credentials.
- Parse JSON bodies with tight size limits (`express.json({ limit: '100kb' })`) to prevent memory exhaustion attacks.
- Register a global 4-argument error handler `(err, req, res, next)` at the very bottom of the Express application middleware chain.

