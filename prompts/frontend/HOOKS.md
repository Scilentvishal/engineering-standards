# Custom Hooks Engineering Standards

## 1. Scope & Single Responsibility
- Custom hooks must encapsulate reusable stateful logic or external subscriptions, not raw UI markup.
- Prefix every custom hook with `use` (e.g., `useDebounce`, `useLocalStorage`, `useWindowDimensions`).
- Return concise, typed tuples (for 1-2 items) or structured objects (for 3+ items) to allow clear destructuring and extensibility.

## 2. Dependency Array & Lifecycle Safety
- Always specify exhaustive dependencies in `useEffect`, `useCallback`, and `useMemo`. Never suppress lint rules without a verified architectural comment.
- Clean up subscriptions, event listeners, intervals, and AbortControllers in effect cleanup callbacks to prevent memory leaks.
- Avoid cascading effects where one `useEffect` modifies state solely to trigger a second `useEffect`. Derive values directly during render where possible.

