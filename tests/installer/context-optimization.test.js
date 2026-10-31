import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { installPrompts } from '../../src/installer/install-prompts.js';
import { ensureProjectContext } from '../../src/installer/project-context.js';
import { CursorAdapter } from '../../src/adapters/cursor.js';
import { ClaudeCodeAdapter } from '../../src/adapters/claude-code.js';
import { GenericAdapter } from '../../src/adapters/generic.js';
import { FileManager } from '../../src/installer/file-manager.js';
import { fileExists } from '../../src/utils/paths.js';

describe('token efficiency and progressive context loading', () => {
  let tmpDir;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'eng-standards-context-'));
  });

  afterEach(async () => {
    try {
      await fs.rm(tmpDir, { recursive: true, force: true });
    } catch {}
  });

  it('generates PROJECT_CONTEXT.md with architecture registers', async () => {
    const res = await ensureProjectContext(tmpDir, {
      detectedSummary: ['Next.js detected', 'Prisma ORM detected'],
      categories: ['core', 'frontend', 'database'],
      profiles: ['profile:nextjs', 'profile:prisma']
    });

    expect(res.created).toBe(true);
    expect(await fileExists(res.path)).toBe(true);

    const content = await fs.readFile(res.path, 'utf8');
    expect(content).toContain('Next.js detected, Prisma ORM detected');
    expect(content).toContain('Reusable Component Register');
    expect(content).toContain('Custom Hook Register');
    expect(content).toContain('Database & Persistence Layer');
    expect(content).toContain('All filtering, sorting, searching, and pagination must be executed in database queries');
  });

  it('preserves existing PROJECT_CONTEXT.md on reinstall', async () => {
    const res1 = await ensureProjectContext(tmpDir, { detectedSummary: ['React'] });
    expect(res1.created).toBe(true);

    const customEntry = '### My Custom Shared Button\n<Button variant="primary" />\n';
    await fs.appendFile(res1.path, customEntry, 'utf8');

    // Run again
    const res2 = await ensureProjectContext(tmpDir, { detectedSummary: ['React'] });
    expect(res2.created).toBe(false);

    const contentAfter = await fs.readFile(res1.path, 'utf8');
    expect(contentAfter).toContain('My Custom Shared Button');
  });

  it('stores instruction loading mode in config.json', async () => {
    await installPrompts({
      projectRoot: tmpDir,
      requestedIds: ['core', 'frontend'],
      mode: 'strict',
      force: false
    });

    const fileManager = new FileManager(tmpDir);
    const config = await fileManager.readConfig();
    expect(config.mode).toBe('strict');
  });

  it('Cursor adapter configures domain rules with conditional globs and alwaysApply: false', async () => {
    const adapter = new CursorAdapter(tmpDir);
    const entries = [
      {
        id: 'core',
        name: 'Core Engineering Standards',
        description: 'Core standards',
        category: 'core',
        version: '1.0.0',
        dependencies: [],
        files: [{ id: 'c1', source: 'core/ENGINEERING.md', target: 'core/ENGINEERING.md', description: 'Core' }]
      },
      {
        id: 'frontend',
        name: 'Frontend Engineering Standards',
        description: 'Frontend standards',
        category: 'frontend',
        version: '1.0.0',
        dependencies: ['core'],
        adapterMetadata: { globs: '**/*.{tsx,jsx}' },
        files: [{ id: 'f1', source: 'frontend/FRONTEND.md', target: 'frontend/FRONTEND.md', description: 'Frontend' }]
      }
    ];

    await adapter.configure(entries);

    // Core rule has alwaysApply: true
    const coreRule = await fs.readFile(path.join(tmpDir, '.cursor/rules/core.mdc'), 'utf8');
    expect(coreRule).toContain('alwaysApply: true');
    expect(coreRule).toContain('Progressive Context Loading');

    // Frontend rule has alwaysApply: false and specific globs
    const frontendRule = await fs.readFile(path.join(tmpDir, '.cursor/rules/frontend.mdc'), 'utf8');
    expect(frontendRule).toContain('alwaysApply: false');
    expect(frontendRule).toContain('globs: **/*.{tsx,jsx}');
  });

  it('Claude Code adapter generates Task Routing Table and Code Discovery protocol', async () => {
    const adapter = new ClaudeCodeAdapter(tmpDir);
    const entries = [
      {
        id: 'core',
        name: 'Core Engineering Standards',
        description: 'Core principles',
        category: 'core',
        version: '1.0.0',
        dependencies: [],
        files: [{ id: 'c1', source: 'core/ENGINEERING.md', target: 'core/ENGINEERING.md', description: 'Core' }]
      },
      {
        id: 'database',
        name: 'Database Engineering Standards',
        description: 'Database standards',
        category: 'database',
        version: '1.0.0',
        dependencies: ['core'],
        files: [{ id: 'd1', source: 'database/DATABASE.md', target: 'database/DATABASE.md', description: 'Database' }]
      }
    ];

    await adapter.configure(entries);

    const claudeContent = await fs.readFile(path.join(tmpDir, 'CLAUDE.md'), 'utf8');
    expect(claudeContent).toContain('Task Routing Table');
    expect(claudeContent).toContain('Existing Code Discovery');
    expect(claudeContent).toContain('.engineering-standards/PROJECT_CONTEXT.md');
    expect(claudeContent).toContain('.engineering-standards/database/DATABASE.md');
  });
});

