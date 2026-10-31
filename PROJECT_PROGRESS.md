# Engineering Standards — Project Progress

## Status: All Phases Fully Completed & Token-Optimized

### Completed Features

#### 1. Token Efficiency & Context Optimization Architecture
- [x] **Progressive Context Loading**: Instructions split into Core (always active) and Domain standards loaded strictly on-demand.
- [x] **Instruction Precedence & Explicit User Overrides**:
  - Tier 1: Explicit user instructions in active chat strictly override repository standards.
  - Tier 2: Living project overrides in `.engineering-standards/PROJECT_CONTEXT.md`.
  - Tier 3: Engineering standards as default guardrails.
  - Embedded into Core standard, database performance mandate, and all 4 AI adapters (Cursor, Claude Code, GitHub Copilot, Generic).
- [x] **Task Classification Protocol**: Domain-level mapping (Frontend, Backend, Database, Security, Testing, Trivial).
- [x] **Pre-Implementation Code Discovery Protocol**: Enforces searching existing components, hooks, API fetchers, and database models before writing new code.
- [x] **Instruction Loading Modes**:
  - `minimal`: Lightweight rules for bugfixes and minor tasks.
  - `standard` (default): Progressive domain-level loading for feature development.
  - `strict`: High-rigor invariants for auth, payments, migrations, and critical infrastructure.
  - CLI flag support: `engineering-standards init --mode <minimal|standard|strict>`.
  - Stored in `.engineering-standards/config.json`.
- [x] **Living Project Architecture Register (`PROJECT_CONTEXT.md`)**:
  - Automatically generated in `.engineering-standards/PROJECT_CONTEXT.md`.
  - Maintained with detected tech stack, directory layouts, and registers for reusable components, custom hooks, API clients, and database models.
  - Preserved on updates/reinstalls without overwriting user documentation.
- [x] **AI Adapters Context Optimization**:
  - **Cursor**: `core.mdc` is `alwaysApply: true`. Domain rules (`frontend.mdc`, `backend.mdc`, `database.mdc`, `testing.mdc`) use `alwaysApply: false` with targeted file `globs` so Cursor loads them only when matching files are active.
  - **Claude Code**: Compact `CLAUDE.md` with Task Routing Table mapping domains directly to specific prompt files.
  - **GitHub Copilot**: `.github/copilot-instructions.md` with progressive loading router.
  - **Generic**: `AI_INSTRUCTIONS.md` with progressive context router.

#### 2. Core Architecture & Foundations
- [x] ESM Package with `"type": "module"`.
- [x] CLI entry point in `bin/cli.js` (`commander`, `picocolors`, `zod`).
- [x] Zero audit vulnerabilities.
- [x] Path traversal security guarantees across all file operations (`resolveSafePath`, `isPathInside`).
- [x] Catalog loader, topological dependency resolver, cycle detection (`catalog/prompts.json`).

#### 3. Engineering Prompt Library & Strict Invariants
- [x] Core Engineering (`prompts/core/ENGINEERING.md`).
- [x] Frontend Engineering (Components, Hooks, API Client, State, Accessibility, Testing).
- [x] Backend Engineering (Layered Architecture, Controllers, Services, Repositories, API Design, Auth, Errors, Testing).
- [x] Database Engineering (Database-level filtering/sorting/pagination, keyset pagination, indexing, transactions).
- [x] Security Engineering (Zero trust, OWASP Top 10, secrets management).
- [x] Testing Engineering (Testing pyramid, determinism, regression tests).
- [x] 11 Framework Profiles (React, Next.js, React Native, Express, FastAPI, MongoDB, PostgreSQL, MySQL, Prisma, MERN, Next.js+Prisma).

#### 4. Installer, Updater & Commands
- [x] `init`: Interactive wizard and non-interactive flags with `--mode`.
- [x] `add`: Dynamic addition of categories or profiles.
- [x] `remove`: Safe removal without deleting custom developer content.
- [x] `list`: Formatted terminal output and `--json` support.
- [x] `update`: Three-way merge engine with automatic backup creation.
- [x] `check`: Installation integrity, hash verification, and missing file checks.
- [x] `doctor`: Project diagnostics, framework detection, and mode status.

#### 5. Verification & Testing
- [x] 12 test files, 37 test cases passed (100% success rate).
- [x] End-to-end packed distribution verification test (`tests/package-verification.test.js`).
- [x] Multi-platform CI workflow configured (`.github/workflows/ci.yml`).

---

## Test Results
- **Test Suites**: 12 passed (12 total)
- **Tests**: 38 passed (38 total)
- **Audit**: 0 vulnerabilities
- **npm pack**: Clean, verified, 37 kB package
