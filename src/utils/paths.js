import path from 'node:path';
import fs from 'node:fs/promises';

/**
 * Normalizes a path to forward slashes for consistent POSIX cross-platform comparison.
 * @param {string} p
 * @returns {string}
 */
export function toPosix(p) {
  return p.replace(/\\/g, '/');
}

/**
 * Checks whether targetPath is strictly inside parentPath (prevents path traversal).
 * @param {string} parentPath
 * @param {string} targetPath
 * @returns {boolean}
 */
export function isPathInside(parentPath, targetPath) {
  const rel = path.relative(path.resolve(parentPath), path.resolve(targetPath));
  return !rel.startsWith('..') && !path.isAbsolute(rel);
}

/**
 * Safely resolves a subpath within a base directory, throwing if traversal is detected.
 * @param {string} baseDir
 * @param {string} subPath
 * @returns {string}
 */
export function resolveSafePath(baseDir, subPath) {
  const resolved = path.resolve(baseDir, subPath);
  if (!isPathInside(baseDir, resolved) && path.resolve(baseDir) !== resolved) {
    throw new Error(`Security Violation: Path traversal detected outside base directory: "${subPath}"`);
  }
  return resolved;
}

/**
 * Checks if a file or directory exists asynchronously.
 * @param {string} filePath
 * @returns {Promise<boolean>}
 */
export async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

