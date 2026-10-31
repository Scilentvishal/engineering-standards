import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { installPrompts } from '../../src/installer/install-prompts.js';
import { addCommand } from '../../src/commands/add.js';
import { removeCommand } from '../../src/commands/remove.js';
import { FileManager } from '../../src/installer/file-manager.js';
import { fileExists } from '../../src/utils/paths.js';

describe('add and remove commands', () => {
  let tmpDir;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'eng-standards-add-rem-'));
    // initialize base
    await installPrompts({
      projectRoot: tmpDir,
      requestedIds: ['core'],
      adapters: ['generic'],
      force: false
    });
  });

  afterEach(async () => {
    try {
      await fs.rm(tmpDir, { recursive: true, force: true });
    } catch {}
  });

  it('adds database standards and updates config and files', async () => {
    await addCommand('database', { dir: tmpDir });

    const fileManager = new FileManager(tmpDir);
    const config = await fileManager.readConfig();
    expect(config.categories).toContain('database');

    const dbFileExists = await fileExists(path.join(tmpDir, '.engineering-standards/database/DATABASE.md'));
    expect(dbFileExists).toBe(true);
  });

  it('prevents removing core standards', async () => {
    const exitCodeBefore = process.exitCode;
    await removeCommand('core', { dir: tmpDir });
    expect(process.exitCode).toBe(1);
    process.exitCode = exitCodeBefore || 0;
  });

  it('safely removes an unneeded category', async () => {
    await addCommand('database', { dir: tmpDir });
    await removeCommand('database', { dir: tmpDir });

    const fileManager = new FileManager(tmpDir);
    const config = await fileManager.readConfig();
    expect(config.categories).not.toContain('database');

    const dbFileExists = await fileExists(path.join(tmpDir, '.engineering-standards/database/DATABASE.md'));
    expect(dbFileExists).toBe(false);
  });
});

