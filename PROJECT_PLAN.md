# Engineering Standards — Project Plan & Roadmap

## 1. Vision & Core Objectives
`engineering-standards` is an open-source, modular, customizable engineering standards and AI coding instruction toolkit.
It equips developers and teams to:
- Select and install engineering standards by discipline (Core, Frontend, Backend, Database, Security, Testing).
- Apply framework-specific engineering profiles (React, Next.js, Express, FastAPI, Prisma, etc.).
- Maintain canonical editable standards in `.engineering-standards/` with full developer ownership.
- Connect canonical standards to AI tools (Cursor, Claude Code, GitHub Copilot, Generic AI instructions) using dedicated adapters.
- Perform safe, three-way updates that preserve local user customizations without silent overwrites.
- Validate, check, and diagnose installation integrity via a modern CLI.

---

## 2. Implementation Phases

### Phase 1: Foundation (Current)
- [x] Repository initialization & ESM package setup.
- [ ] Core utilities: logger (`picocolors`), safe paths & traversal prevention, SHA-256 hashing.
- [ ] Catalog architecture (`catalog/prompts.json`) & Zod schema validation.
- [ ] Comprehensive Markdown prompts:
  - Core Engineering (`prompts/core/`)
  - Frontend Engineering (`prompts/frontend/`)
  - Backend Engineering (`prompts/backend/`)
  - Database Engineering (`prompts/database/` with strict database-level filtering/pagination rules)
  - Security Engineering (`prompts/security/`)
  - Testing Engineering (`prompts/testing/`)
- [ ] Dependency resolution & circular dependency detection.
- [ ] CLI setup (`bin/cli.js`, `src/cli/index.js`, `src/commands/list.js`).
- [ ] Automated tests for catalog, validation, paths, and `list` command.

### Phase 2: Installer & Management Commands
- [ ] Interactive & non-interactive `init` command (`@inquirer/prompts`).
- [ ] `add` and `remove` commands with dependency resolution.
- [ ] Canonical configuration generation (`.engineering-standards/config.json`).
- [ ] Manifest lockfile generation (`manifest.lock.json` with versions and hashes).
- [ ] Existing project conflict handling and non-destructive installs.

### Phase 3: AI Integrations
- [ ] Cursor adapter (`.cursor/rules/*.mdc` with frontmatter).
- [ ] Claude Code adapter (`CLAUDE.md`).
- [ ] GitHub Copilot adapter (`.github/copilot-instructions.md`).
- [ ] Generic adapter (`AI_INSTRUCTIONS.md`).
- [ ] Preservation of existing user configurations in AI tool target files.

### Phase 4: Framework-Specific Profiles
- [ ] Frontend profiles: React, Next.js, React Native.
- [ ] Backend profiles: Node.js, Express, FastAPI.
- [ ] Database profiles: MongoDB, PostgreSQL, MySQL.
- [ ] ORM & Combined: Prisma, MERN stack, Next.js + Prisma.
- [ ] Project framework auto-detection engine (`src/detector/`).

### Phase 5: Safe Updates & Three-Way Merging
- [ ] Upstream snapshot tracking.
- [ ] Three-way diff & merge algorithm (ancestor, local, upstream).
- [ ] Conflict detection & conflict resolution reporting.
- [ ] Backup creation and rollback mechanism.
- [ ] `update` command with interactive preview.

### Phase 6: Validation, Diagnostics & Doctor
- [ ] `check` command: schema check, missing files, broken adapter links.
- [ ] `doctor` command: deep diagnostic report of project configuration, git status, and recommendations.

### Phase 7: Quality, Security & Cross-Platform Verification
- [ ] Comprehensive test suite across all modules (Vitest).
- [ ] Path traversal and security audits.
- [ ] Windows, macOS, Linux compatibility checks (slashes, line-endings, casing).
- [ ] `npm pack` verification and packaging test.

### Phase 8: Open-Source Documentation & Release
- [ ] Complete `README.md`, `CONTRIBUTING.md`, `CHANGELOG.md`, `LICENSE`.
- [ ] GitHub issue and PR templates.
- [ ] GitHub Actions CI workflows.
- [ ] Release checklist and verification.
