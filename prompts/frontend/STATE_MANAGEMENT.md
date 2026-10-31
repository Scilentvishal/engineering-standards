# Frontend State Management

## 1. State Hierarchy
- **URL State**: Sort criteria, filters, page numbers, active tab index, and search queries belong in URL search parameters to ensure shareability and browser history navigation.
- **Local Component State**: Ephemeral UI toggles, open/closed modal states, active form input focus.
- **Global Application State**: Authenticated user session, theme preferences, notifications.

## 2. Store Hygiene
- Keep stores normalized to prevent stale references and nested mutation complexity.
- Selectors should be fine-grained to prevent unnecessary re-rendering of entire component trees.
- State updates must remain purely functional and deterministic without hidden asynchronous side-effects in reducers.

