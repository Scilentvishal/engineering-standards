# Testing Engineering Standards

## 1. Testing Pyramid & Proportions
- **Unit Tests (70%)**: Fast, isolated, deterministic tests covering pure domain logic, mathematical models, and edge cases.
- **Integration Tests (20%)**: Testing boundaries between components, services, database queries, and API endpoints.
- **End-to-End Tests (10%)**: Testing critical user journeys through real browsers or complete API flows.

## 2. Determinism & Isolation
- Tests must be strictly deterministic: zero flaky tests, zero timing races, zero dependency on external third-party network APIs during unit/integration runs.
- Every test suite must seed its own isolated test data and clean up afterwards.
- Avoid shared mutable state between test runs.

