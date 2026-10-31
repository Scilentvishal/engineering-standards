import { CursorAdapter } from './cursor.js';
import { ClaudeCodeAdapter } from './claude-code.js';
import { GitHubCopilotAdapter } from './github-copilot.js';
import { GenericAdapter } from './generic.js';

export const AVAILABLE_ADAPTERS = ['cursor', 'claude-code', 'copilot', 'generic'];

/**
 * Returns instantiated adapters for specified adapter names.
 * @param {string} projectRoot
 * @param {string[]} adapterNames
 */
export function getAdapters(projectRoot, adapterNames = ['generic']) {
  const adapters = [];
  const normalized = new Set(adapterNames.map(a => a.toLowerCase().trim()));

  if (normalized.has('cursor')) {
    adapters.push({ name: 'cursor', instance: new CursorAdapter(projectRoot) });
  }
  if (normalized.has('claude-code') || normalized.has('claude')) {
    adapters.push({ name: 'claude-code', instance: new ClaudeCodeAdapter(projectRoot) });
  }
  if (normalized.has('copilot') || normalized.has('github-copilot')) {
    adapters.push({ name: 'copilot', instance: new GitHubCopilotAdapter(projectRoot) });
  }
  if (normalized.has('generic')) {
    adapters.push({ name: 'generic', instance: new GenericAdapter(projectRoot) });
  }

  return adapters;
}

/**
 * Applies all requested adapters.
 * @param {string} projectRoot
 * @param {string[]} adapterNames
 * @param {import('../catalog/validate-catalog.js').CatalogEntrySchema[]} entries
 */
export async function applyAdapters(projectRoot, adapterNames, entries) {
  const adapters = getAdapters(projectRoot, adapterNames);
  for (const { instance } of adapters) {
    await instance.configure(entries);
  }
}

