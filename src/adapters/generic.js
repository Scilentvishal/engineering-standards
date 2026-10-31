import fs from 'node:fs/promises';
import path from 'node:path';
import { fileExists, resolveSafePath } from '../utils/paths.js';

export class GenericAdapter {
  /**
   * @param {string} projectRoot
   */
  constructor(projectRoot) {
    this.projectRoot = path.resolve(projectRoot);
    this.instructionsFile = resolveSafePath(this.projectRoot, 'AI_INSTRUCTIONS.md');
  }

  /**
   * Configures AI_INSTRUCTIONS.md with progressive context loading routing and user precedence.
   * @param {import('../catalog/validate-catalog.js').CatalogEntrySchema[]} entries
   */
  async configure(entries) {
    const startTag = '<!-- ENGINEERING_STANDARDS_MANAGED_START -->';
    const endTag = '<!-- ENGINEERING_STANDARDS_MANAGED_END -->';

    const routerRows = [];
    for (const entry of entries) {
      const primaryFile = entry.files[0];
      if (primaryFile) {
        routerRows.push(`- **${entry.name}**: \`.engineering-standards/${primaryFile.target}\``);
      }
    }

    const managedBlock = `${startTag}
## Engineering Standards & Architecture Router

> **Instruction Precedence**: Explicit user commands in active chat **always override** repository standards. If the user explicitly asks for an exception, follow their request. Otherwise, apply these standards as default guardrails.

> **Progressive Context Protocol**: Classify your task and consult only the matching standard document to preserve context window:
${routerRows.join('\n')}

### Core Architectural Invariants:
1. **Existing Code Discovery**: Search existing components, custom hooks, and utilities before implementing new ones.
2. **Project Context**: Consult \`.engineering-standards/PROJECT_CONTEXT.md\` for project architecture and registries.
3. **Database Operations**: Perform all filtering, sorting, searching, and pagination at the database level. Never fetch entire collections into memory unless explicitly asked by the user for small fixed data.
4. **Instruction Modes**:
   - *Minimal*: For simple 1-line fixes, follow clean code without reading deep standards.
   - *Standard*: Review the matching domain standard above.
   - *Strict*: For auth, payments, or database migrations, enforce strict security, architecture, and query optimization.
${endTag}`;

    let originalContent = '';
    if (await fileExists(this.instructionsFile)) {
      originalContent = await fs.readFile(this.instructionsFile, 'utf8');
    }

    let finalContent = '';
    if (originalContent.includes(startTag) && originalContent.includes(endTag)) {
      const regex = new RegExp(`${startTag}[\\s\\S]*?${endTag}`);
      finalContent = originalContent.replace(regex, managedBlock);
    } else if (originalContent.trim().length > 0) {
      finalContent = originalContent.trimEnd() + '\n\n' + managedBlock + '\n';
    } else {
      finalContent = `# AI Coding Instructions\n\n${managedBlock}\n`;
    }

    await fs.writeFile(this.instructionsFile, finalContent, 'utf8');
  }

  /**
   * Cleans up the managed block from AI_INSTRUCTIONS.md.
   */
  async cleanup() {
    if (!(await fileExists(this.instructionsFile))) return;
    const original = await fs.readFile(this.instructionsFile, 'utf8');
    const startTag = '<!-- ENGINEERING_STANDARDS_MANAGED_START -->';
    const endTag = '<!-- ENGINEERING_STANDARDS_MANAGED_END -->';

    if (original.includes(startTag) && original.includes(endTag)) {
      const regex = new RegExp(`\\n*${startTag}[\\s\\S]*?${endTag}\\n*`);
      const cleaned = original.replace(regex, '\n').trim();
      if (cleaned.length === 0) {
        await fs.unlink(this.instructionsFile);
      } else {
        await fs.writeFile(this.instructionsFile, cleaned + '\n', 'utf8');
      }
    }
  }
}
