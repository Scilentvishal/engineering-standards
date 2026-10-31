import { describe, it, expect } from 'vitest';
import { hashContent } from '../../src/utils/hashing.js';

describe('hashing utility', () => {
  it('computes consistent sha256 hash regardless of CRLF or LF line endings', () => {
    const unixString = '# Header\nLine 1\nLine 2\n';
    const windowsString = '# Header\r\nLine 1\r\nLine 2\r\n';

    const hash1 = hashContent(unixString);
    const hash2 = hashContent(windowsString);

    expect(hash1).toBe(hash2);
    expect(hash1).toMatch(/^[a-f0-9]{64}$/);
  });

  it('produces different hashes for different contents', () => {
    const hash1 = hashContent('abc');
    const hash2 = hashContent('xyz');
    expect(hash1).not.toBe(hash2);
  });
});

