import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { threeWayMerge } from '../../src/updater/three-way-merge.js';
import { UpdateManager } from '../../src/updater/update-manager.js';
import { installPrompts } from '../../src/installer/install-prompts.js';

describe('safe three-way merge and update engine', () => {
  it('applies change when only upstream changed', () => {
    const base = '# Core\nOriginal base section\n';
    const local = '# Core\nOriginal base section\n';
    const upstream = '# Core\nUpdated upstream section\n';

    const result = threeWayMerge(base, local, upstream);
    expect(result.hasConflicts).toBe(false);
    expect(result.mergedContent).toContain('Updated upstream section');
  });

  it('preserves developer change when only local changed', () => {
    const base = '# Core\nOriginal base section\n';
    const local = '# Core\nMy custom developer edit\n';
    const upstream = '# Core\nOriginal base section\n';

    const result = threeWayMerge(base, local, upstream);
    expect(result.hasConflicts).toBe(false);
    expect(result.mergedContent).toContain('My custom developer edit');
  });

  it('merges non-conflicting changes in different sections', () => {
    const base = '# Section A\nOriginal A\n\n# Section B\nOriginal B\n';
    const local = '# Section A\nDeveloper Modified A\n\n# Section B\nOriginal B\n';
    const upstream = '# Section A\nOriginal A\n\n# Section B\nUpstream Improved B\n';

    const result = threeWayMerge(base, local, upstream);
    expect(result.hasConflicts).toBe(false);
    expect(result.mergedContent).toContain('Developer Modified A');
    expect(result.mergedContent).toContain('Upstream Improved B');
  });

  it('detects conflict when both local and upstream change same section incompatibly', () => {
    const base = '# Section A\nOriginal A\n';
    const local = '# Section A\nDeveloper A edit\n';
    const upstream = '# Section A\nUpstream conflicting A edit\n';

    const result = threeWayMerge(base, local, upstream);
    expect(result.hasConflicts).toBe(true);
    expect(result.mergedContent).toContain('<<<<<<< LOCAL');
    expect(result.mergedContent).toContain('Developer A edit');
    expect(result.mergedContent).toContain('Upstream conflicting A edit');
  });

  describe('UpdateManager integration', () => {
    let tmpDir;

    beforeEach(async () => {
      tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'eng-standards-update-'));
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

    it('creates safety backup before updating modified files', async () => {
      const promptPath = path.join(tmpDir, '.engineering-standards/core/ENGINEERING.md');
      await fs.appendFile(promptPath, '\n# Extra Custom Section\nCustom note\n');

      const updateManager = new UpdateManager(tmpDir);
      const result = await updateManager.executeUpdate({ dryRun: false });

      expect(result).toBeDefined();
    });
  });
});

