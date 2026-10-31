import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { detectProjectFrameworks } from '../../src/detector/detect-framework.js';
import { detectProject } from '../../src/detector/detect-project.js';

describe('framework and project detection', () => {
  let tmpDir;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'eng-standards-detect-'));
  });

  afterEach(async () => {
    try {
      await fs.rm(tmpDir, { recursive: true, force: true });
    } catch {}
  });

  it('detects Next.js and Prisma from package.json and files', async () => {
    await fs.writeFile(
      path.join(tmpDir, 'package.json'),
      JSON.stringify({ dependencies: { next: '^14.0.0', '@prisma/client': '^5.0.0' } }),
      'utf8'
    );
    await fs.mkdir(path.join(tmpDir, 'prisma'), { recursive: true });
    await fs.writeFile(path.join(tmpDir, 'prisma/schema.prisma'), '// prisma schema', 'utf8');

    const result = await detectProjectFrameworks(tmpDir);

    expect(result.detectedCategories).toContain('frontend');
    expect(result.detectedCategories).toContain('database');
    expect(result.detectedProfiles).toContain('profile:nextjs');
    expect(result.detectedProfiles).toContain('profile:prisma');
    expect(result.detectedProfiles).toContain('profile:nextjs-prisma');
  });

  it('detects Express and MongoDB', async () => {
    await fs.writeFile(
      path.join(tmpDir, 'package.json'),
      JSON.stringify({ dependencies: { express: '^4.18.0', mongoose: '^7.0.0' } }),
      'utf8'
    );

    const result = await detectProjectFrameworks(tmpDir);

    expect(result.detectedCategories).toContain('backend');
    expect(result.detectedCategories).toContain('database');
    expect(result.detectedProfiles).toContain('profile:express');
    expect(result.detectedProfiles).toContain('profile:mongodb');
  });

  it('detects TypeScript from tsconfig.json or dependencies', async () => {
    await fs.writeFile(path.join(tmpDir, 'tsconfig.json'), '{}', 'utf8');
    const result = await detectProjectFrameworks(tmpDir);
    expect(result.detectedProfiles).toContain('profile:typescript');
    expect(result.summary).toContain('TypeScript detected');
  });

  it('detects monorepo markers and package managers', async () => {
    await fs.writeFile(path.join(tmpDir, 'pnpm-workspace.yaml'), 'packages:\n  - "packages/*"', 'utf8');
    await fs.writeFile(path.join(tmpDir, 'pnpm-lock.yaml'), 'lockfileVersion: 5.4', 'utf8');

    const info = await detectProject(tmpDir);
    expect(info.isMonorepo).toBe(true);
    expect(info.packageManager).toBe('pnpm');
  });
});

