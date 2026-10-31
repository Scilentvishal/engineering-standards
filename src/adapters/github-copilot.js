import fs from 'node:fs/promises';
import path from 'node:path';
import { fileExists, resolveSafePath } from '../utils/paths.js';

export class GitHubCopilotAdapter {
  /**
   * @param {string} projectRoot
   */
  constructor(projectRoot) {
    this.projectRoot = path.resolve(projectRoot);
    this.githubDir = path.resolve(this.projectRoot, '.github');
    this.instructionsFile = resolveSafePath(this.githubDir, 'copilot-instructions.md');
  }

  /**
   * Configures GitHub Copilot custom instructions with progressive loading, user precedence, and scope boundary.
   * @param {import('../catalog/validate-catalog.js').CatalogEntrySchema[]} entries
   */
  async configure(entries) {
    await fs.mkdir(this.githubDir, { recursive: true });

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
## Engineering Standards & Architecture Rules

> **Strict Scope Boundary**: **Touch ONLY the code the user asks you to touch.** NEVER modify, refactor, or rewrite existing working code unless explicitly told to do so. Suggest improvements in chat comments, but keep untouched files intact.

> **Instruction Precedence**: Explicit user directions in active chat **always take precedence** over these rules.

> **Progressive Context Loading**: Check the task domain and consult only the matching standard document:
${routerRows.join('\n')}

### Core Invariants:
1. **Scope Containment**: Edit only the requested lines/functions. Never rewrite working legacy code unprompted.
2. **Existing Code Discovery**: Search existing components, hooks, and utilities before creating new ones.
3. **Project Context**: Check \`.engineering-standards/PROJECT_CONTEXT.md\` for structure and reusable registries.
4. **Database Performance**: Execute all filtering, sorting, and pagination at the database level. Never fetch entire collections into memory unless explicitly asked by the user for small fixed data.
5. **Instruction Modes**:
   - *Minimal*: Follow standard clean code for quick fixes.
   - *Standard*: Review the matching domain standard above.
   - *Strict*: For auth, payments, or database migrations, enforce strict security and query optimization.
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
      finalContent = `# GitHub Copilot Instructions\n\n${managedBlock}\n`;
    }

    await fs.writeFile(this.instructionsFile, finalContent, 'utf8');
  }

  /**
   * Cleans up the managed block from copilot-instructions.md.
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
