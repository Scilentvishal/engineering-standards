# Architecture Decision Records (ADRs)

## ADR-001: Modern JavaScript ESM Architecture
- **Date**: 2026-10-31
- **Status**: Accepted
- **Context**: The package will run on modern Node.js environments (v20+) across developer workstations and CI runners.
- **Decision**: Use native ECMAScript Modules (`"type": "module"`) without transpilation layers like Babel or Webpack.
- **Consequences**: Standard `import`/`export` syntax, native top-level await where suitable, fast startup times, zero bundle overhead for open-source consumers.

## ADR-002: Catalog-Driven Prompt Registry
- **Date**: 2026-10-31
- **Status**: Accepted
- **Context**: The system must support core categories and numerous framework profiles without hardcoding installation paths or file lists in CLI logic.
- **Decision**: Centralize all prompt definitions in `catalog/prompts.json` validated by a Zod schema. Prompts are pure Markdown files referenced by relative path.
- **Consequences**: Adding new engineering disciplines or profiles requires only adding Markdown files and catalog entries. CLI commands dynamically read from this single source of truth.

## ADR-003: Database-Level Query Operations Enforcement
- **Date**: 2026-10-31
- **Status**: Accepted
- **Context**: AI coding assistants frequently generate inefficient patterns, such as fetching entire database collections into server memory to filter, sort, or paginate in JavaScript.
- **Decision**: Prompts for database engineering and framework profiles must strictly mandate database-level filtering, sorting, indexing, and cursor-based pagination. In-memory collection filtering is explicitly prohibited in the prompt guidance.
- **Consequences**: Generated code by AI agents using these standards avoids critical memory bloat and performance degradation on production datasets.

## ADR-004: Three-Way Merge for Safe Customization Preservation
- **Date**: 2026-10-31
- **Status**: Accepted
- **Context**: Developers need full freedom to edit and customize installed prompt files. Running `npx engineering-standards update` must never silently wipe these changes.
- **Decision**: Store the base upstream SHA-256 and base copy in `.engineering-standards/manifest.lock.json` and snapshots to enable 3-way diffing and merging (base vs local vs upstream).
- **Consequences**: Updates apply non-conflicting improvements cleanly while reporting conflicts and preserving local modifications safely.

## ADR-005: Dependencies Selection
- **Date**: 2026-10-31
- **Status**: Accepted
- **Context**: The CLI must be reliable, secure, lightweight, and cross-platform.
- **Decision**:
  - `commander`: Proven standard for CLI option parsing and subcommand handling.
  - `@inquirer/prompts`: Modern, lightweight, modular interactive terminal UI.
  - `picocolors`: Ultra-fast, zero-dependency ANSI color library.
  - `zod`: Industry-standard runtime schema validation.
  - `vitest`: Fast, native ESM test runner.
- **Consequences**: Zero audit vulnerabilities, minimal footprint, maximum test execution speed.

## ADR-006: Progressive Context Loading & Token Optimization
- **Date**: 2026-10-31
- **Status**: Accepted
- **Context**: Unconstrained instruction dumps consume massive AI context windows, degrading model reasoning and wasting tokens on irrelevant domains (e.g. reading database standards during a frontend CSS fix).
- **Decision**:
  - Implement a hierarchical routing architecture: Core is always loaded; domain standards are mapped via Task Classification Routing Tables and conditional file globs (in Cursor).
  - Generate an editable `.engineering-standards/PROJECT_CONTEXT.md` living register to document existing components, hooks, API clients, and database models.
  - Establish a pre-implementation **Code Discovery Protocol** forcing agents to search existing code for reusable elements before implementing new code.
  - Introduce three explicit **Instruction Loading Modes**: Minimal, Standard, and Strict.
- **Consequences**: Dramatic reduction in context consumption per prompt, higher precision code generation, eliminated duplicated code, and verified adherence to critical architecture and database performance mandates.
