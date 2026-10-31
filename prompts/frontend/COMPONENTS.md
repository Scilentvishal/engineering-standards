# Reusable Component Architecture

## 1. Component Design Guidelines
- **Single Responsibility**: Each component must do one visual or behavioral task. If a component grows past 150-200 lines, extract subcomponents.
- **Strict Prop Types**: Define explicit, documented TypeScript interfaces or prop schemas for every component. Never use `any`.
- **Sensible Defaults**: Provide safe default props for optional configuration (e.g., `variant = 'primary'`, `size = 'md'`).
- **Controlled vs. Uncontrolled**: Provide controlled behavior (`value` + `onChange`) for form elements, with optional uncontrolled support (`defaultValue`).

## 2. Component Directory Structure
Organize components cleanly with co-located assets:
```
components/
  Button/
    Button.tsx
    Button.test.tsx
    Button.module.css (or styled equivalent)
    index.ts
```

## 3. Composition Patterns
- Use slots or `children` instead of deeply nested boolean props (e.g. `<Card header={<CardHeader />} footer={<CardFooter />} />`).
- Compound components pattern: For complex UI widgets (Accordion, Dropdown, Tabs), use parent context to share state cleanly across subcomponents.

