# Contributing to Engineering Standards

Thank you for contributing to `engineering-standards`! We appreciate your help in building a reliable, open-source engineering standards ecosystem.

## Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/cogitix/engineering-standards.git
   cd engineering-standards
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the test suite**:
   ```bash
   npm test
   ```

4. **Validate catalog and package integrity**:
   ```bash
   npm run validate
   ```

---

## Project Structure Overview

- `bin/cli.js`: CLI executable entry point.
- `src/cli/`: Command-line interface orchestration and argument routing.
- `src/commands/`: Implementation of CLI commands (`init`, `add`, `remove`, `list`, `update`, `check`, `doctor`).
- `src/catalog/`: Catalog loader, dependency resolver, and Zod validator.
- `src/installer/`: Prompt installation, file management, and conflict assessment.
- `src/adapters/`: AI tool adapters (Cursor, Claude Code, GitHub Copilot, Generic).
- `src/updater/`: Three-way merge engine, version comparison, and backup management.
- `src/detector/`: Project type and framework detection heuristics.
- `prompts/`: Canonical source Markdown prompt documents.
- `catalog/prompts.json`: The single source of truth describing all prompt entries.
- `tests/`: Automated Vitest test suites.

---

## How to Add a New Prompt Category or Framework Profile

1. **Create the Markdown prompt file**:
   Add your markdown instructions in `prompts/<category>/<FILE>.md` or `prompts/profiles/<profile>/<FILE>.md`.

2. **Register in `catalog/prompts.json`**:
   Add an entry with:
   - `id`: Unique identifier (prefix profiles with `profile:`).
   - `name`: Human-readable title.
   - `description`: Summary of what the standard covers.
   - `category`: Category name or `"profile"`.
   - `version`: SemVer string (e.g., `"1.0.0"`).
   - `dependencies`: List of prerequisite entry IDs.
   - `files`: Array of `{ id, source, target, description }`.

3. **Verify with the validation script**:
   ```bash
   npm run validate
   ```

4. **Write tests**:
   Add a test case in `tests/` asserting your new entry is discoverable and installable.

---

## Pull Request Guidelines

- Ensure all tests pass: `npm test`.
- Verify zero lint/validation errors: `npm run validate`.
- Follow JavaScript ESM conventions and keep functions small and focused.
- Adhere to the strict database-level operation mandate for all database-related prompt content.

