import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { toPosix, isPathInside, resolveSafePath } from '../../src/utils/paths.js';

describe('paths utility', () => {
  it('normalizes backslashes to forward slashes', () => {
    expect(toPosix('foo\\bar\\baz.md')).toBe('foo/bar/baz.md');
  });

  it('correctly identifies if path is inside parent directory', () => {
    const parent = path.resolve('project');
    const child = path.resolve('project/sub/file.md');
    const outside = path.resolve('other/file.md');

    expect(isPathInside(parent, child)).toBe(true);
    expect(isPathInside(parent, outside)).toBe(false);
  });

  it('rejects path traversal attempts with resolveSafePath', () => {
    const base = path.resolve('project');
    expect(() => resolveSafePath(base, '../outside.md')).toThrow(/Security Violation/);
    expect(() => resolveSafePath(base, '../../etc/passwd')).toThrow(/Security Violation/);
  });

  it('allows safe subpaths with resolveSafePath', () => {
    const base = path.resolve('project');
    const safe = resolveSafePath(base, 'nested/prompt.md');
    expect(isPathInside(base, safe)).toBe(true);
  });
});

