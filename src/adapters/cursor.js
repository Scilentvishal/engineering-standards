import fs from 'node:fs/promises';
import path from 'node:path';
import { resolveSafePath } from '../utils/paths.js';

export class CursorAdapter {
  /**
   * @param {string} projectRoot
   */
  constructor(projectRoot) {
    this.projectRoot = path.resolve(projectRoot);
    this.cursorRulesDir = path.resolve(this.projectRoot, '.cursor/rules');
  }

  /**
   * Configures Cursor rules with progressive context loading, user precedence, and strict scope containment.
   * Core rule is always loaded; domain rules load conditionally via globs.
   * 
   * @param {import('../catalog/validate-catalog.js').CatalogEntrySchema[]} entries
   */
  async configure(entries) {
    await fs.mkdir(this.cursorRulesDir, { recursive: true });

    for (const entry of entries) {
      const ruleFileName = `${entry.id.replace(/:/g, '-')}.mdc`;
      const ruleFilePath = resolveSafePath(this.cursorRulesDir, ruleFileName);

      const isCore = entry.id === 'core';
      const globs = entry.adapterMetadata?.globs || '';
      // Only core is always applied; domain-specific rules load strictly based on matching file globs
      const alwaysApply = isCore ? true : Boolean(entry.adapterMetadata?.alwaysApply);

      const fileList = entry.files
        .map(f => `- [.engineering-standards/${f.target}](.engineering-standards/${f.target}) — ${f.description}`)
        .join('\n');

      let contextDirectives = '';
      if (isCore) {
        contextDirectives = `
## Strict Scope Boundary: Only Touch Code Explicitly Requested
- **Touch ONLY the code the user asks you to touch.**
- **NEVER** refactor, reformat, or rewrite existing working code that was not requested.
- If existing code has issues or violates standards, mention recommendations in chat text; **do not modify existing code unless explicitly told by the user**.
- Always preserve backward compatibility for existing callers.

## Precedence & Pragmatic User Overrides
- **Rule 0 (Top Priority)**: Explicit user instructions in active chat **always override** repository standards. If the user explicitly asks for an exception, workaround, or specific implementation, follow their instruction.
- **Rule 1**: Follow standards by default to prevent accidental anti-patterns and performance flaws.

## Progressive Context Loading & Workflow
1. **Task Classification**: Identify if the task involves Frontend, Backend, Database, Security, or Testing.
2. **Code Discovery**: Search existing components, hooks, utilities, and API fetchers before implementing new ones.
3. **Project Context**: Consult [.engineering-standards/PROJECT_CONTEXT.md](.engineering-standards/PROJECT_CONTEXT.md).
4. **Instruction Modes**:
   - Minimal: For quick bug fixes; follow standard clean code without excessive file reading.
   - Standard (Default): Load relevant domain standards for the task.
   - Strict: For auth/payments/migrations; strictly follow all security, validation, and database rules.
`;
      }

      const content = `---
description: ${entry.name} - ${entry.description}
globs: ${globs}
alwaysApply: ${alwaysApply}
---

# ${entry.name}

${entry.description}
${contextDirectives}
## Canonical Engineering Standards
${fileList}

## AI Agent Instructions
Adhere to the canonical standards above by default when writing or refactoring code within this rule's scope. Only touch files and functions the user explicitly asks you to touch, unless explicitly instructed otherwise by the user.
`;

      await fs.writeFile(ruleFilePath, content, 'utf8');
    }
  }

  /**
   * Cleans up rule files for entries that are removed.
   * @param {string[]} removedIds
   */
  async cleanup(removedIds) {
    for (const id of removedIds) {
      const ruleFileName = `${id.replace(/:/g, '-')}.mdc`;
      const ruleFilePath = path.resolve(this.cursorRulesDir, ruleFileName);
      try {
        await fs.unlink(ruleFilePath);
      } catch {
        // file didn't exist or already removed
      }
    }
  }
}
