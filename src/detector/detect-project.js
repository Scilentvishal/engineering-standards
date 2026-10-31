import fs from 'node:fs/promises';
import path from 'node:path';
import { fileExists } from '../utils/paths.js';

/**
 * Inspects a project directory for monorepo configuration and project type.
 * @param {string} projectRoot
 */
export async function detectProject(projectRoot) {
  const root = path.resolve(projectRoot);
  const isMonorepo = (await fileExists(path.resolve(root, 'pnpm-workspace.yaml'))) ||
                     (await fileExists(path.resolve(root, 'lerna.json'))) ||
                     (await fileExists(path.resolve(root, 'turbo.json')));

  const hasGit = await fileExists(path.resolve(root, '.git'));
  const hasPackageJson = await fileExists(path.resolve(root, 'package.json'));

  let packageManager = 'npm';
  if (await fileExists(path.resolve(root, 'pnpm-lock.yaml'))) {
    packageManager = 'pnpm';
  } else if (await fileExists(path.resolve(root, 'yarn.lock'))) {
    packageManager = 'yarn';
  } else if (await fileExists(path.resolve(root, 'bun.lockb')) || await fileExists(path.resolve(root, 'bun.lock'))) {
    packageManager = 'bun';
  }

  return {
    root,
    isMonorepo,
    hasGit,
    hasPackageJson,
    packageManager
  };
}

