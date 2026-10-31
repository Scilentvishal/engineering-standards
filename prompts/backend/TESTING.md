# Backend Testing Standards

## 1. Unit Testing
- Test domain services in isolation. Mock database repositories and external network calls.
- Assert business logic, edge conditions, permissions, and thrown exceptions.

## 2. Integration & API Testing
- Test controllers and routes using real HTTP test clients (Supertest, TestClient).
- Run integration tests against dedicated ephemeral test database instances (e.g. Testcontainers or test schema).
- Verify end-to-end request lifecycle: authentication -> request validation -> service logic -> database commit -> response envelope.

