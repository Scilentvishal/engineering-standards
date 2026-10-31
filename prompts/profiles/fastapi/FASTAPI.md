# FastAPI Engineering Profile

## 1. Clean Async Python Architecture
- Organize endpoints into modular `APIRouter` instances grouped by domain context.
- Use `Pydantic` schemas for strict request body parsing, query validation, and response serialization (`response_model`).
- Utilize FastAPI's `Depends` system for dependency injection (database sessions, authentication, permission checks).
- Implement database session lifetimes using `asynccontextmanager` or yield-based dependency functions to guarantee session closure.

## 2. Best Practices & Error Handling
- Use `async def` for I/O-bound operations (database queries, HTTP calls). Use standard `def` for CPU-bound computations so FastAPI runs them in a threadpool without blocking the asyncio event loop.
- Register custom `RequestValidationError` and domain `HTTPException` handlers to ensure uniform JSON error envelopes.
- Configure CORS middleware explicitly with authorized origins and methods.

