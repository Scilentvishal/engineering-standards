import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { installPrompts } from '../../src/installer/install-prompts.js';
import { applyAdapters } from '../../src/adapters/index.js';
import { checkCommand } from '../../src/commands/check.js';
import { doctorCommand } from '../../src/commands/doctor.js';

function stripAnsi(str) {
  return str.replace(/\u001b\[\d+m/g, '');
}

describe('check and doctor commands', () => {
  let tmpDir;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'eng-standards-chk-'));
    const result = await installPrompts({
      projectRoot: tmpDir,
      requestedIds: ['core'],
      adapters: ['generic'],
      force: false
    });
    const mockEntries = [
      {
        id: 'core',
        name: 'Core Engineering Standards',
        description: 'Core standards',
        files: [{ id: 'core-1', source: 'core/ENGINEERING.md', target: 'core/ENGINEERING.md', description: 'Core' }]
      }
    ];
    await applyAdapters(tmpDir, ['generic'], mockEntries);
  });

  afterEach(async () => {
    try {
      await fs.rm(tmpDir, { recursive: true, force: true });
    } catch {}
  });

  it('runs check successfully on healthy installation', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await checkCommand({ dir: tmpDir });

    expect(logSpy).toHaveBeenCalled();
    const output = stripAnsi(logSpy.mock.calls.map(c => c[0] || '').join('\n'));
    expect(output).toContain('Unmodified Upstream Files: 1');

    logSpy.mockRestore();
  });

  it('runs doctor successfully', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await doctorCommand({ dir: tmpDir });

    expect(logSpy).toHaveBeenCalled();
    const output = stripAnsi(logSpy.mock.calls.map(c => c[0] || '').join('\n'));
    expect(output).toContain('Node.js Version:');
    expect(output).toContain('Installed Categories: core');

    logSpy.mockRestore();
  });
});
