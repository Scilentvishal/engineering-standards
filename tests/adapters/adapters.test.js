import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { CursorAdapter } from '../../src/adapters/cursor.js';
import { ClaudeCodeAdapter } from '../../src/adapters/claude-code.js';
import { GitHubCopilotAdapter } from '../../src/adapters/github-copilot.js';
import { GenericAdapter } from '../../src/adapters/generic.js';
import { fileExists } from '../../src/utils/paths.js';

describe('AI adapters', () => {
  let tmpDir;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'eng-standards-adapters-'));
  });

  afterEach(async () => {
    try {
      await fs.rm(tmpDir, { recursive: true, force: true });
    } catch {}
  });

  const mockEntries = [
    {
      id: 'core',
      name: 'Core Engineering Standards',
      description: 'Core standards',
      category: 'core',
      version: '1.0.0',
      dependencies: [],
      files: [{ id: 'core-1', source: 'core/ENGINEERING.md', target: 'core/ENGINEERING.md', description: 'Core principles' }]
    }
  ];

  it('configures Cursor rules with frontmatter', async () => {
    const adapter = new CursorAdapter(tmpDir);
    await adapter.configure(mockEntries);

    const ruleFile = path.join(tmpDir, '.cursor/rules/core.mdc');
    expect(await fileExists(ruleFile)).toBe(true);

    const content = await fs.readFile(ruleFile, 'utf8');
    expect(content).toContain('---');
    expect(content).toContain('alwaysApply: true');
    expect(content).toContain('.engineering-standards/core/ENGINEERING.md');
  });

  it('configures CLAUDE.md preserving existing user instructions', async () => {
    const claudeFile = path.join(tmpDir, 'CLAUDE.md');
    await fs.writeFile(claudeFile, '# Existing Project Notes\nUser custom instruction\n', 'utf8');

    const adapter = new ClaudeCodeAdapter(tmpDir);
    await adapter.configure(mockEntries);

    const content = await fs.readFile(claudeFile, 'utf8');
    expect(content).toContain('User custom instruction');
    expect(content).toContain('<!-- ENGINEERING_STANDARDS_MANAGED_START -->');
    expect(content).toContain('<!-- ENGINEERING_STANDARDS_MANAGED_END -->');
    expect(content).toContain('.engineering-standards/core/ENGINEERING.md');
  });

  it('configures GitHub Copilot instructions preserving existing content', async () => {
    const copilotFile = path.join(tmpDir, '.github/copilot-instructions.md');
    await fs.mkdir(path.dirname(copilotFile), { recursive: true });
    await fs.writeFile(copilotFile, '# Existing Copilot Instructions\n', 'utf8');

    const adapter = new GitHubCopilotAdapter(tmpDir);
    await adapter.configure(mockEntries);

    const content = await fs.readFile(copilotFile, 'utf8');
    expect(content).toContain('Existing Copilot Instructions');
    expect(content).toContain('<!-- ENGINEERING_STANDARDS_MANAGED_START -->');
    expect(content).toContain('.engineering-standards/core/ENGINEERING.md');
  });

  it('configures generic AI_INSTRUCTIONS.md', async () => {
    const adapter = new GenericAdapter(tmpDir);
    await adapter.configure(mockEntries);

    const genericFile = path.join(tmpDir, 'AI_INSTRUCTIONS.md');
    expect(await fileExists(genericFile)).toBe(true);

    const content = await fs.readFile(genericFile, 'utf8');
    expect(content).toContain('AI Coding Instructions');
    expect(content).toContain('.engineering-standards/core/ENGINEERING.md');
  });
});

