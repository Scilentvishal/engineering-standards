import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateCatalog } from './validate-catalog.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Returns absolute path to package root.
 */
export function getPackageRoot() {
  return path.resolve(__dirname, '../../');
}

/**
 * Returns absolute path to prompts root.
 */
export function getPromptsRoot() {
  return path.resolve(getPackageRoot(), 'prompts');
}

/**
 * Returns absolute path to catalog file.
 */
export function getCatalogPath() {
  return path.resolve(getPackageRoot(), 'catalog/prompts.json');
}

/**
 * Loads and validates the catalog from disk.
 * @param {object} [options]
 * @param {boolean} [options.verifyFiles=true] Whether to check that markdown files exist
 * @returns {Promise<{ version: string, entries: import('./validate-catalog.js').CatalogEntrySchema[] }>}
 */
export async function loadCatalog(options = { verifyFiles: true }) {
  const catalogPath = getCatalogPath();
  const rawContent = await fs.readFile(catalogPath, 'utf8');
  const catalogData = JSON.parse(rawContent);

  const promptsDir = options.verifyFiles ? getPromptsRoot() : undefined;
  const validation = await validateCatalog(catalogData, promptsDir);

  if (!validation.valid) {
    throw new Error(`Invalid catalog at ${catalogPath}:\n- ${validation.errors.join('\n- ')}`);
  }

  return catalogData;
}

