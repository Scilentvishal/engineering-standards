# Engineering Standards

[![CI](https://github.com/cogitix/engineering-standards/actions/workflows/ci.yml/badge.svg)](https://github.com/cogitix/engineering-standards/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/engineering-standards.svg)](https://www.npmjs.com/package/engineering-standards)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node: >=20](https://img.shields.io/badge/node-%3E%3D20.0.0-green.svg)](https://nodejs.org)

**Engineering Standards** is a modular, customizable engineering standards and AI coding instruction toolkit optimized for **token efficiency and progressive context loading**.

It equips developers and teams to maintain consistent, reusable, scalable, secure, and maintainable software architecture across their projects using AI coding agents (Cursor, Claude Code, GitHub Copilot, Windsurf, Aider, etc.) without exhausting the model's context window.

---

## Why Engineering Standards?

AI coding assistants are exceptionally capable, but without structured architectural constraints, they often:
- **Exhaust Context Windows**: Reading hundreds of irrelevant engineering rules on simple tasks (e.g. loading SQL database rules while styling a button).
- **Duplicate Existing Code**: Recreating button components, date formatters, and custom hooks that already exist in your codebase.
- **Perform In-Memory Database Filtering**: Pulling thousands of records into backend memory to filter, sort, or paginate in JavaScript.
- **Mix Architectural Layers**: Writing SQL queries directly inside HTTP controllers or React components.

`engineering-standards` solves this with a **Progressive Context Architecture**:

```text
[ Task Request ] ──> 1. Task Classification (Frontend / Backend / Database / Security / Testing)
                  ──> 2. Existing Code Discovery (Search existing components & hooks)
                  ──> 3. Progressive Read (Load ONLY the relevant domain standard)
                  ──> 4. Verified Implementation (Run tests & check invariants)
```

---

## Key Features

- ⚡ **Progressive Context Loading**: Instructions are tiered hierarchically. Domain standards are loaded on-demand via task routers or file-specific globs (Cursor), preventing prompt bloat.
- 📋 **Living Project Context (`PROJECT_CONTEXT.md`)**: Generates an editable architectural register of existing components, hooks, API clients, and folder structures so AI agents discover and reuse existing code instead of recreating duplicates.
- 🎚️ **Instruction Loading Modes**:
  - **Minimal**: Lightweight, high-velocity instructions for simple bugfixes and single-line adjustments.
  - **Standard** *(Default)*: Progressive domain loading for feature additions.
  - **Strict**: Maximum rigor for auth, payments, database migrations, and critical infrastructure.
- 🎯 **Modular Disciplines**: Install Core, Frontend, Backend, Database, Security, and Testing standards independently.
- 🚀 **Framework Profiles**: Specialized instructions for React, Next.js (App Router, RSC), React Native, Express, FastAPI, MongoDB, PostgreSQL, MySQL, and Prisma.
- 🤖 **Multi-Tool AI Adapters**: Automatically generates and maintains instructions for:
  - **Cursor**: Native `.cursor/rules/*.mdc` with conditional `globs` and `alwaysApply: false` for domain rules.
  - **Claude Code**: Compact Task Routing Table in `CLAUDE.md`.
  - **GitHub Copilot**: `.github/copilot-instructions.md`.
  - **Generic**: Portable `AI_INSTRUCTIONS.md` for Windsurf, Aider, Roo Code, Cody, etc.
- 🛡️ **Full Developer Ownership**: Every installed Markdown prompt is completely editable. The package never locks files or silently overwrites your custom modifications.
- 🔄 **Safe Three-Way Merge Engine**: Updates merge upstream improvements with your custom modifications cleanly, automatically alerting you to conflicting sections and creating safety backups.
- 🔍 **Diagnostics & Health**: `check` and `doctor` commands diagnose project health, detect uninstalled framework profiles, and verify configuration integrity.

---

## Quick Start

Initialize standards interactively:

```bash
npx engineering-standards init
```

Or non-interactively using CLI flags:

```bash
# Frontend + Backend + Database with Next.js profile in Standard mode
npx engineering-standards init --frontend --backend --database -p nextjs --mode standard -y

# Minimal mode for small repos
npx engineering-standards init --frontend -p react --mode minimal -y

# Full MERN stack installation
npx engineering-standards init -p mern -y
```

---

## CLI Commands

### 1. `init`
Initialize standards in the current or target directory with optional mode flag (`minimal`, `standard`, `strict`).
```bash
npx engineering-standards init
npx engineering-standards init --mode strict
npx engineering-standards init --frontend --backend --database -p prisma -y
```

### 2. `list`
Display available engineering categories, profiles, file lists, and dependencies.
```bash
npx engineering-standards list
npx engineering-standards list --json
```

### 3. `add <target>`
Add a specific standard or profile:
```bash
npx engineering-standards add frontend
npx engineering-standards add database
npx engineering-standards add profile:prisma
```

### 4. `remove <target>`
Safely remove a standard or profile without deleting custom content:
```bash
npx engineering-standards remove frontend
npx engineering-standards remove profile:express
```

### 5. `update`
Safely update installed standards using the three-way merge engine:
```bash
npx engineering-standards update
npx engineering-standards update --dry-run
```

### 6. `check`
Verify configuration validity, manifest integrity, and file presence:
```bash
npx engineering-standards check
```

### 7. `doctor`
Diagnose project configuration, detect frameworks, and recommend missing profiles:
```bash
npx engineering-standards doctor
```

---

## Project Structure After Installation

```
my-project/
├── .engineering-standards/           # Canonical editable standards (Developer owned)
│   ├── config.json                   # User configuration & instruction mode
│   ├── manifest.lock.json            # Version and SHA-256 hash tracking
│   ├── PROJECT_CONTEXT.md            # Living architecture & reusable components register
│   ├── core/
│   │   └── ENGINEERING.md
│   ├── frontend/
│   │   ├── FRONTEND.md
│   │   ├── COMPONENTS.md
│   │   ├── HOOKS.md
│   │   └── API_INTEGRATION.md
│   ├── backend/
│   │   ├── BACKEND.md
│   │   └── LAYERED_ARCHITECTURE.md
│   ├── database/
│   │   ├── DATABASE.md
│   │   └── PAGINATION_AND_PERFORMANCE.md
│   └── profiles/
│       └── NEXTJS.md
├── .cursor/
│   └── rules/                        # Cursor rule files with conditional file globs
├── CLAUDE.md                         # Claude Code compact task router
├── .github/
│   └── copilot-instructions.md       # GitHub Copilot instructions
└── AI_INSTRUCTIONS.md                # Generic AI instruction router
```

---

## Strict Database Performance Invariant

All database prompts enforce the following architectural rule:

> **All filtering, sorting, searching, and pagination must be executed at the database level.**
> AI coding assistants are strictly forbidden from fetching entire database collections into application runtime memory to filter, sort, or paginate in JavaScript/Python memory.

---

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details on adding new prompts, framework profiles, and writing tests.

---

## License

[MIT](LICENSE) © 2026 Engineering Standards Contributors
