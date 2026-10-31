import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { installPrompts } from '../../src/installer/install-prompts.js';
import { FileManager } from '../../src/installer/file-manager.js';
import { fileExists } from '../../src/utils/paths.js';

describe('installer engine', () => {
  let tmpDir;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'eng-standards-test-'));
  });

  afterEach(async () => {
    try {
      await fs.rm(tmpDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  });

  it('installs core and frontend engineering standards in clean directory', async () => {
    const result = await installPrompts({
      projectRoot: tmpDir,
      requestedIds: ['frontend'],
      adapters: ['generic'],
      force: false
    });

    // Automatically includes core and frontend
    expect(result.installedIds).toContain('core');
    expect(result.installedIds).toContain('frontend');

    const fileManager = new FileManager(tmpDir);
    const config = await fileManager.readConfig();
    const manifest = await fileManager.readManifest();

    expect(config).toBeDefined();
    expect(config.categories).toContain('core');
    expect(config.categories).toContain('frontend');

    expect(manifest).toBeDefined();
    expect(manifest.files.length).toBeGreaterThan(0);

    // Verify canonical prompt file exists on disk
    const corePromptExists = await fileExists(path.join(tmpDir, '.engineering-standards/core/ENGINEERING.md'));
    const frontendPromptExists = await fileExists(path.join(tmpDir, '.engineering-standards/frontend/FRONTEND.md'));

    expect(corePromptExists).toBe(true);
    expect(frontendPromptExists).toBe(true);
  });

  it('preserves locally modified prompt files without overwriting', async () => {
    // 1. Initial install
    await installPrompts({
      projectRoot: tmpDir,
      requestedIds: ['core'],
      adapters: ['generic'],
      force: false
    });

    const promptPath = path.join(tmpDir, '.engineering-standards/core/ENGINEERING.md');
    const customContent = '# My Custom Core Guidelines\nDo not overwrite me!';
    await fs.writeFile(promptPath, customContent, 'utf8');

    // 2. Second install attempt without force
    const secondResult = await installPrompts({
      projectRoot: tmpDir,
      requestedIds: ['core'],
      adapters: ['generic'],
      force: false
    });

    expect(secondResult.skippedModified).toContain('core/ENGINEERING.md');

    // Verify file content was not overwritten
    const currentContent = await fs.readFile(promptPath, 'utf8');
    expect(currentContent).toBe(customContent);
  });
});

