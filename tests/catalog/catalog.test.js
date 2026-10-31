import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { loadCatalog, getPromptsRoot } from '../../src/catalog/load-catalog.js';
import { validateCatalog } from '../../src/catalog/validate-catalog.js';
import { resolveDependencies } from '../../src/catalog/resolve-dependencies.js';

describe('catalog management and validation', () => {
  it('loads and validates production catalog successfully', async () => {
    const catalog = await loadCatalog({ verifyFiles: true });
    expect(catalog.version).toBeDefined();
    expect(catalog.entries.length).toBeGreaterThanOrEqual(10);
  });

  it('detects circular dependencies in catalog entries', async () => {
    const cyclicCatalog = {
      version: '1.0.0',
      entries: [
        {
          id: 'a',
          name: 'Entry A',
          description: 'A',
          category: 'core',
          version: '1.0.0',
          dependencies: ['b'],
          files: [{ id: 'f1', source: 'core/ENGINEERING.md', target: 'core/ENGINEERING.md' }]
        },
        {
          id: 'b',
          name: 'Entry B',
          description: 'B',
          category: 'backend',
          version: '1.0.0',
          dependencies: ['a'],
          files: [{ id: 'f2', source: 'backend/BACKEND.md', target: 'backend/BACKEND.md' }]
        }
      ]
    };

    const result = await validateCatalog(cyclicCatalog);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('Circular dependency'))).toBe(true);
  });

  it('detects missing files when prompts directory is verified', async () => {
    const invalidCatalog = {
      version: '1.0.0',
      entries: [
        {
          id: 'dummy',
          name: 'Dummy',
          description: 'Non-existent file test',
          category: 'core',
          version: '1.0.0',
          dependencies: [],
          files: [{ id: 'f1', source: 'does/not/exist.md', target: 'dummy.md' }]
        }
      ]
    };

    const promptsRoot = getPromptsRoot();
    const result = await validateCatalog(invalidCatalog, promptsRoot);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('File missing on disk'))).toBe(true);
  });

  it('resolves dependencies in topological order and always includes core', async () => {
    const catalog = await loadCatalog({ verifyFiles: false });
    const resolved = resolveDependencies(['profile:nextjs'], catalog.entries);

    // Dependencies of profile:nextjs: frontend, profile:react -> and frontend depends on core
    expect(resolved).toContain('core');
    expect(resolved).toContain('frontend');
    expect(resolved).toContain('profile:react');
    expect(resolved).toContain('profile:nextjs');

    // Verify ordering: core before frontend, frontend before profile:react, profile:react before profile:nextjs
    const coreIdx = resolved.indexOf('core');
    const frontIdx = resolved.indexOf('frontend');
    const reactIdx = resolved.indexOf('profile:react');
    const nextIdx = resolved.indexOf('profile:nextjs');

    expect(coreIdx).toBeLessThan(frontIdx);
    expect(frontIdx).toBeLessThan(reactIdx);
    expect(reactIdx).toBeLessThan(nextIdx);
  });
});

