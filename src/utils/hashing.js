import crypto from 'node:crypto';
import fs from 'node:fs/promises';

/**
 * Calculates SHA-256 hash of a string.
 * @param {string} content
 * @returns {string}
 */
export function hashContent(content) {
  // Normalize Windows CRLF to LF for deterministic hashes across operating systems
  const normalized = content.replace(/\r\n/g, '\n');
  return crypto.createHash('sha256').update(normalized, 'utf8').digest('hex');
}

/**
 * Calculates SHA-256 hash of a file's content.
 * @param {string} filePath
 * @returns {Promise<string>}
 */
export async function hashFile(filePath) {
  const content = await fs.readFile(filePath, 'utf8');
  return hashContent(content);
}

