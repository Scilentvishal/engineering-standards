import { describe, it, expect, vi } from 'vitest';
import { listCommand } from '../../src/commands/list.js';

describe('list command', () => {
  it('outputs json when --json option is passed', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await listCommand({ json: true });

    expect(logSpy).toHaveBeenCalled();
    const output = logSpy.mock.calls[0][0];
    const parsed = JSON.parse(output);

    expect(parsed.version).toBeDefined();
    expect(Array.isArray(parsed.entries)).toBe(true);
    expect(parsed.entries.some(e => e.id === 'core')).toBe(true);

    logSpy.mockRestore();
  });

  it('prints human-readable formatted list', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await listCommand({});

    expect(logSpy).toHaveBeenCalled();
    const calls = logSpy.mock.calls.map(c => c[0] || '').join('\n');
    expect(calls).toContain('Core Engineering Standards');
    expect(calls).toContain('Frontend Engineering Standards');

    logSpy.mockRestore();
  });
});

