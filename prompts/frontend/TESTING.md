# Frontend Testing Standards

## 1. Testing Philosophy
- Test components from the user's perspective rather than asserting internal implementation details or private state.
- Query elements using accessible role queries (`getByRole('button', { name: /submit/i })`) first, label text second, and test-ids only when accessible selectors are infeasible.

## 2. Test Coverage Tiers
- **Unit & Component Tests**: Test component rendering, interactive user events, conditional states (empty, loading, error), and accessibility violations.
- **Hook Tests**: Verify custom hook state transitions, asynchronous updates, and proper cleanup.
- **Mocking**: Mock network boundaries using tools like MSW (Mock Service Worker) instead of mocking internal fetch calls.

