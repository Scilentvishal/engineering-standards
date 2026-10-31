import fs from 'node:fs/promises';
import path from 'node:path';
import { fileExists, resolveSafePath } from '../utils/paths.js';

export class ClaudeCodeAdapter {
  /**
   * @param {string} projectRoot
   */
  constructor(projectRoot) {
    this.projectRoot = path.resolve(projectRoot);
    this.claudeFile = resolveSafePath(this.projectRoot, 'CLAUDE.md');
  }

  /**
   * Updates or creates CLAUDE.md with a progressive, token-efficient routing table and user override directive.
   * @param {import('../catalog/validate-catalog.js').CatalogEntrySchema[]} entries
   */
  async configure(entries) {
    const startTag = '<!-- ENGINEERING_STANDARDS_MANAGED_START -->';
    const endTag = '<!-- ENGINEERING_STANDARDS_MANAGED_END -->';

    const routerRows = [];
    for (const entry of entries) {
      const primaryFile = entry.files[0];
      if (primaryFile) {
        routerRows.push(`| **${entry.name}** | \`.engineering-standards/${primaryFile.target}\` | ${entry.description} |`);
      }
    }

    const managedBlock = `${startTag}
## Engineering Standards & Architecture Router

> **Instruction Precedence**: Explicit user commands in active conversation **always override** repository standards. If the user explicitly asks for an exception, follow their request. Otherwise, apply these standards as default guardrails.

> **Progressive Context Protocol**: Do not read all engineering files at once. Classify the task domain and read ONLY the relevant standard before writing code.

### Task Routing Table
| Domain / Profile | Primary Standard Document | Scope |
| :--- | :--- | :--- |
${routerRows.join('\n')}

### Execution Guidelines
1. **Existing Code Discovery**: Before creating new components, hooks, or utilities, search existing files to reuse and compose rather than duplicate.
2. **Project Context**: Check \`.engineering-standards/PROJECT_CONTEXT.md\` for project structure, tech stack, and reusable registers.
3. **Database Performance Rule**: Always execute filtering, sorting, searching, and pagination at the database level. Never fetch entire collections into application memory (unless user explicitly requests in-memory handling for small static data).
4. **Instruction Modes**:
   - *Minimal*: For simple 1-line fixes, follow clean code without reading deep standards.
   - *Standard*: Read the matching domain standard above before coding.
   - *Strict*: For auth, payments, or database migrations, inspect security and database performance standards.
${endTag}`;

    let originalContent = '';
    if (await fileExists(this.claudeFile)) {
      originalContent = await fs.readFile(this.claudeFile, 'utf8');
    }

    let finalContent = '';
    if (originalContent.includes(startTag) && originalContent.includes(endTag)) {
      const regex = new RegExp(`${startTag}[\\s\\S]*?${endTag}`);
      finalContent = originalContent.replace(regex, managedBlock);
    } else if (originalContent.trim().length > 0) {
      finalContent = originalContent.trimEnd() + '\n\n' + managedBlock + '\n';
    } else {
      finalContent = `# Claude Code Project Instructions\n\n${managedBlock}\n`;
    }

    await fs.writeFile(this.claudeFile, finalContent, 'utf8');
  }

  /**
   * Removes the managed engineering standards block from CLAUDE.md.
   */
  async cleanup() {
    if (!(await fileExists(this.claudeFile))) return;
    const original = await fs.readFile(this.claudeFile, 'utf8');
    const startTag = '<!-- ENGINEERING_STANDARDS_MANAGED_START -->';
    const endTag = '<!-- ENGINEERING_STANDARDS_MANAGED_END -->';

    if (original.includes(startTag) && original.includes(endTag)) {
      const regex = new RegExp(`\\n*${startTag}[\\s\\S]*?${endTag}\\n*`);
      const cleaned = original.replace(regex, '\n').trim();
      if (cleaned.length === 0) {
        await fs.unlink(this.claudeFile);
      } else {
        await fs.writeFile(this.claudeFile, cleaned + '\n', 'utf8');
      }
    }
  }
}
