# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-10-31

### Added
- **Core Package & CLI**: Native Node.js ESM executable `engineering-standards` built on Commander, Picocolors, and Zod.
- **Catalog Architecture**: Single source of truth in `catalog/prompts.json` with topological dependency resolution and cycle detection.
- **Engineering Disciplines**:
  - Core Engineering (architecture principles, clean code, error handling)
  - Frontend Engineering (components, hooks, api client, state management, accessibility, testing)
  - Backend Engineering (layered architecture, controllers, services, repositories, REST design, validation, auth)
  - Database Engineering (mandatory database-level filtering/sorting/pagination, keyset pagination, index design, transactions)
  - Security Engineering (zero trust, OWASP Top 10, secrets management)
  - Testing Engineering (testing pyramid, determinism, regression tests)
- **Framework Profiles**:
  - React, Next.js (App Router, RSC), React Native
  - Express.js, FastAPI
  - MongoDB, PostgreSQL, MySQL
  - Prisma ORM
  - Composite profiles: MERN Stack, Next.js + Prisma
- **AI Tool Adapters**:
  - Cursor (`.cursor/rules/*.mdc`)
  - Claude Code (`CLAUDE.md` with managed comment markers)
  - GitHub Copilot (`.github/copilot-instructions.md`)
  - Generic AI instructions (`AI_INSTRUCTIONS.md`)
- **Safe Three-Way Update Engine**:
  - True 3-way merge algorithm preserving local user modifications
  - Automatic timestamped backups prior to updates
  - Conflict reporting and proposed merge output
- **Commands**:
  - `init`: Interactive selection wizard and automated non-interactive flag support
  - `add`: Dynamic addition of categories or framework profiles
  - `remove`: Safe removal without deleting custom content
  - `list`: Human-readable formatted and `--json` catalog listing
  - `update`: Safe updates with `--dry-run` and `--force`
  - `check`: Installation integrity, hash verification, and missing file checks
  - `doctor`: Project diagnostics and framework detection
- **Automated Test Suite**: Full Vitest test coverage across catalog, installer, adapters, updater, detector, commands, and `npm pack` distribution verification.

