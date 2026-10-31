import { describe, it, expect } from 'vitest';
import { execSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { fileExists } from '../src/utils/paths.js';

describe('packaged npm distribution verification', () => {
  it('installs and executes from packaged tarball in a clean external project', async () => {
    // Generate fresh pack tarball for test
    execSync('npm pack', { stdio: 'pipe' });
    const tarballPath = path.resolve('engineering-standards-0.1.0.tgz');
    expect(await fileExists(tarballPath)).toBe(true);

    const testProjectDir = await fs.mkdtemp(path.join(os.tmpdir(), 'eng-standards-pack-test-'));

    try {
      // 1. Initialize empty package.json in temp directory
      await fs.writeFile(
        path.join(testProjectDir, 'package.json'),
        JSON.stringify({ name: 'external-test-app', version: '1.0.0', type: 'module' }, null, 2),
        'utf8'
      );

      // 2. Install the tarball into external test app
      execSync(`npm install "${tarballPath}"`, {
        cwd: testProjectDir,
        stdio: 'pipe'
      });

      // 3. Run the installed binary via npx / node_modules/.bin
      const binPath = path.join(testProjectDir, 'node_modules/.bin/engineering-standards');
      execSync(`npx engineering-standards init --frontend --database --security -y`, {
        cwd: testProjectDir,
        stdio: 'pipe'
      });

      // 4. Assert installed directory structure
      const standardsDir = path.join(testProjectDir, '.engineering-standards');
      expect(await fileExists(path.join(standardsDir, 'config.json'))).toBe(true);
      expect(await fileExists(path.join(standardsDir, 'manifest.lock.json'))).toBe(true);
      expect(await fileExists(path.join(standardsDir, 'core/ENGINEERING.md'))).toBe(true);
      expect(await fileExists(path.join(standardsDir, 'frontend/FRONTEND.md'))).toBe(true);
      expect(await fileExists(path.join(standardsDir, 'database/PAGINATION_AND_PERFORMANCE.md'))).toBe(true);
      expect(await fileExists(path.join(standardsDir, 'security/SECURITY.md'))).toBe(true);

      // 5. Run health check
      const checkOutput = execSync(`npx engineering-standards check`, {
        cwd: testProjectDir,
        encoding: 'utf8'
      });
      expect(checkOutput).toContain('Installation is completely healthy');
    } finally {
      await fs.rm(testProjectDir, { recursive: true, force: true }).catch(() => {});
      await fs.rm(tarballPath, { force: true }).catch(() => {});
    }
  }, 60000);
});
