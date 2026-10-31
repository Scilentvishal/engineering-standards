import fs from 'node:fs/promises';
import path from 'node:path';
import { fileExists } from '../utils/paths.js';

/**
 * Detects framework profiles present in the target project.
 * @param {string} projectRoot
 * @returns {Promise<{ detectedCategories: string[], detectedProfiles: string[], summary: string[] }>}
 */
export async function detectProjectFrameworks(projectRoot) {
  const root = path.resolve(projectRoot);
  const detectedCategories = new Set(['core']);
  const detectedProfiles = new Set();
  const summary = [];

  let packageJson = null;
  const pkgPath = path.resolve(root, 'package.json');
  if (await fileExists(pkgPath)) {
    try {
      packageJson = JSON.parse(await fs.readFile(pkgPath, 'utf8'));
    } catch {
      // ignore invalid package.json
    }
  }

  const allDeps = {
    ...packageJson?.dependencies,
    ...packageJson?.devDependencies,
    ...packageJson?.peerDependencies
  };

  // 1. Next.js check
  const hasNextConfig = (await fileExists(path.resolve(root, 'next.config.js'))) ||
                        (await fileExists(path.resolve(root, 'next.config.mjs'))) ||
                        (await fileExists(path.resolve(root, 'next.config.ts')));
  if (hasNextConfig || 'next' in allDeps) {
    detectedCategories.add('frontend');
    detectedProfiles.add('profile:react');
    detectedProfiles.add('profile:nextjs');
    summary.push('Next.js detected');
  }

  // 2. React Native check
  if ('react-native' in allDeps || (await fileExists(path.resolve(root, 'app.json')))) {
    detectedCategories.add('frontend');
    detectedProfiles.add('profile:react');
    detectedProfiles.add('profile:react-native');
    summary.push('React Native detected');
  } else if ('react' in allDeps && !detectedProfiles.has('profile:nextjs')) {
    detectedCategories.add('frontend');
    detectedProfiles.add('profile:react');
    summary.push('React detected');
  }

  // 3. Express check
  if ('express' in allDeps) {
    detectedCategories.add('backend');
    detectedProfiles.add('profile:express');
    summary.push('Express.js detected');
  }

  // 4. Prisma check
  const hasPrismaSchema = (await fileExists(path.resolve(root, 'prisma/schema.prisma')));
  if (hasPrismaSchema || 'prisma' in allDeps || '@prisma/client' in allDeps) {
    detectedCategories.add('database');
    detectedProfiles.add('profile:prisma');
    summary.push('Prisma ORM detected');
  }

  // 5. MongoDB / Mongoose check
  if ('mongoose' in allDeps || 'mongodb' in allDeps) {
    detectedCategories.add('database');
    detectedProfiles.add('profile:mongodb');
    summary.push('MongoDB/Mongoose detected');
  }

  // 6. PostgreSQL / MySQL check
  if ('pg' in allDeps || 'postgres' in allDeps) {
    detectedCategories.add('database');
    detectedProfiles.add('profile:postgresql');
    summary.push('PostgreSQL detected');
  }
  if ('mysql' in allDeps || 'mysql2' in allDeps) {
    detectedCategories.add('database');
    detectedProfiles.add('profile:mysql');
    summary.push('MySQL detected');
  }

  // 7. FastAPI / Python check
  const hasPython = (await fileExists(path.resolve(root, 'pyproject.toml'))) ||
                    (await fileExists(path.resolve(root, 'requirements.txt')));
  if (hasPython) {
    let pyReqs = '';
    try {
      if (await fileExists(path.resolve(root, 'requirements.txt'))) {
        pyReqs += await fs.readFile(path.resolve(root, 'requirements.txt'), 'utf8');
      }
      if (await fileExists(path.resolve(root, 'pyproject.toml'))) {
        pyReqs += await fs.readFile(path.resolve(root, 'pyproject.toml'), 'utf8');
      }
    } catch {
      // ignore
    }
    if (pyReqs.toLowerCase().includes('fastapi')) {
      detectedCategories.add('backend');
      detectedProfiles.add('profile:fastapi');
      summary.push('FastAPI detected');
    }
  }

  // 8. Composite profile recommendations
  if (detectedProfiles.has('profile:react') &&
      detectedProfiles.has('profile:express') &&
      detectedProfiles.has('profile:mongodb')) {
    detectedProfiles.add('profile:mern');
    summary.push('Full MERN Stack profile matched');
  }

  if (detectedProfiles.has('profile:nextjs') && detectedProfiles.has('profile:prisma')) {
    detectedProfiles.add('profile:nextjs-prisma');
    summary.push('Next.js + Prisma composite profile matched');
  }

  // Testing & Security recommendations
  if ('jest' in allDeps || 'vitest' in allDeps || 'mocha' in allDeps || 'pytest' in allDeps) {
    detectedCategories.add('testing');
  }

  return {
    detectedCategories: Array.from(detectedCategories),
    detectedProfiles: Array.from(detectedProfiles),
    summary
  };
}

