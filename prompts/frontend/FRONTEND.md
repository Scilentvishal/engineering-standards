# Frontend Engineering Standards

## 1. Architectural Principles
- **Predictable Data Flow**: Maintain unidirectional data flow from top-level state holders down through presentational components via explicit props or context.
- **Component Decomposition**: Distinguish between container/page components (data fetching, state coordination) and presentational components (pure rendering, style, callbacks).
- **Zero Heavy Computation in Render**: Move heavy calculations into memoized values, web workers, or backend queries.

## 2. Accessibility (a11y)
- Use native semantic HTML elements (`<button>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<header>`, `<footer>`) instead of generic `<div>` with click handlers.
- Provide accessible names (`aria-label`, `aria-labelledby`) for icon-only buttons and interactive controls.
- Ensure all interactive elements are focusable and operable via standard keyboard navigation (`Tab`, `Enter`, `Space`, `Escape`).
- Maintain sufficient color contrast ratios according to WCAG AA guidelines (minimum 4.5:1 for normal text, 3:1 for large text).

## 3. Performance Optimization
- **Code Splitting & Lazy Loading**: Split routes and heavy dialog/modal components using dynamic imports.
- **Bundle Hygiene**: Import specific module subpaths instead of monolithic libraries (e.g. `import debounce from 'lodash/debounce'`).
- **Asset Optimization**: Serve modern image formats (AVIF, WebP) with explicit `width` and `height` attributes to eliminate Cumulative Layout Shift (CLS).
- **Virtualization**: Use list virtualization for rendering lists exceeding 50-100 elements.

