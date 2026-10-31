# React Engineering Profile

## 1. Component Architecture & State Management
- Utilize functional components with React Hooks exclusively.
- Lift state up only when siblings genuinely share data; keep state co-located where it is used.
- Prefer `useReducer` for complex state transitions with multiple interdependent sub-values.
- Use `React.memo`, `useMemo`, and `useCallback` judiciously based on performance profiling, not prematurely on trivial primitives.

## 2. Best Practices
- Never mutate state directly; always create fresh copies using spread syntax or immutable helper patterns.
- Keep JSX clean and declarative: break complicated nested conditionals into dedicated sub-components or guard clauses.
- Ensure all list items rendered via `.map()` provide a stable, unique `key` from the data domain (e.g. `item.id`), never array indices when items can reorder, filter, or delete.

