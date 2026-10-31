# Core Engineering Standards

## 1. Context Efficiency & Progressive Loading Protocol
To minimize unnecessary context consumption while maintaining high implementation quality, AI agents must follow this workflow:

### A. Task Classification
Before reading standards or writing code, classify the affected domain(s):
- **Frontend**: UI components, styling, client state, custom hooks, web APIs.
- **Backend**: HTTP routes, services, middleware, domain business logic.
- **Database**: Schemas, migrations, queries, indexing, pagination, ORMs.
- **Security**: Authentication, authorization, input validation, secrets, tenant isolation.
- **Testing**: Unit, integration, E2E, regression test suites.
- **Trivial Fix**: Simple 1-2 line typo or bugfix in a known file (bypass heavy prompt reads).

*Rule: Load and inspect only the engineering standard documents relevant to the classified domain(s).*

### B. Pre-Implementation Code Discovery
Before creating new functions, components, or utilities:
1. Search the codebase for existing reusable components, hooks, or utility functions.
2. Search for existing API client functions and database query abstractions.
3. Reuse and compose existing implementations rather than generating duplicate variants.
4. Avoid scanning unrelated project directories.

### C. Instruction Loading Modes
- **Minimal Mode**: For simple tasks, minor bugfixes, or isolated refactors. Adhere strictly to basic clean code and code discovery.
- **Standard Mode** (Default): For standard feature additions and updates. Consult domain-specific standards for the affected areas.
- **Strict Mode**: For critical systems (auth, payments, data migrations, multi-tier architectures). Enforce full architectural layering, formal threat modeling, comprehensive tests, and database query plan inspection.

### D. Project Context (`PROJECT_CONTEXT.md`)
- Always check `.engineering-standards/PROJECT_CONTEXT.md` for project-specific folder structure, tech stack, reusable components, and conventions.
- When introducing a new reusable component, hook, or architectural decision, update `PROJECT_CONTEXT.md`.
- *Verification Rule*: Never blindly trust stale project context; verify critical paths against active source files.

---

## 2. Foundational Architecture Principles
- **Separation of Concerns (SoC)**: Isolate UI rendering, application services, domain business rules, and data persistence into distinct tiers.
- **Single Responsibility (SRP)**: Every module, class, and function must have exactly one reason to change. Aim for under 30-40 lines per function.
- **Composition over Inheritance**: Favor lightweight composed functions, interfaces, and hooks over deep inheritance hierarchies.
- **Immutability by Default**: Treat input arguments and domain data as immutable; avoid in-place object mutation.
- **Explicit Naming**: Use descriptive camelCase for functions/variables, PascalCase for types/components, and SCREAMING_SNAKE_CASE for constants. Prefix booleans with `is`, `has`, `should`, or `can`.

---

## 3. Robust Error Handling & Defensive Programming
- **Never Swallow Errors**: Never use empty catch blocks. Catch, log with contextual metadata, and either recover or bubble structured domain errors.
- **Structured Domain Errors**: Extend base application error classes (e.g., `ValidationError`, `NotFoundError`, `UnauthorizedError`) with HTTP status and operational flags.
- **Guard Clauses**: Validate preconditions at function ingress and fail fast.
- **Safe Logging**: Never log passwords, tokens, API keys, or personally identifiable information (PII).

---

## 4. Implementation Verification
Token efficiency must never compromise verification:
- Inspect relevant existing tests before modifying code.
- Run automated tests after changes to verify regression freedom.
- Verify edge cases: null/undefined, empty arrays, boundary values, network failure states.
