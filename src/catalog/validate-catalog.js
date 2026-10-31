import { z } from 'zod';
import path from 'node:path';
import { fileExists, resolveSafePath } from '../utils/paths.js';

export const CatalogFileSchema = z.object({
  id: z.string().min(1),
  source: z.string().min(1),
  target: z.string().min(1),
  description: z.string().default('')
});

export const CatalogEntrySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  category: z.enum(['core', 'frontend', 'backend', 'database', 'security', 'testing', 'profile']),
  files: z.array(CatalogFileSchema).min(1),
  dependencies: z.array(z.string()).default([]),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  compatibility: z.record(z.any()).optional(),
  adapterMetadata: z.object({
    globs: z.string().optional(),
    alwaysApply: z.boolean().optional(),
    tags: z.array(z.string()).optional()
  }).optional()
});

export const CatalogSchema = z.object({
  version: z.string(),
  entries: z.array(CatalogEntrySchema)
});

/**
 * Validates catalog data structure, references, and circular dependencies.
 * @param {object} catalogData
 * @param {string} [promptsRootDir]
 * @returns {Promise<{ valid: boolean, errors: string[] }>}
 */
export async function validateCatalog(catalogData, promptsRootDir) {
  const errors = [];

  const parsed = CatalogSchema.safeParse(catalogData);
  if (!parsed.success) {
    return {
      valid: false,
      errors: parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`)
    };
  }

  const entries = parsed.data.entries;
  const entryMap = new Map();

  for (const entry of entries) {
    if (entryMap.has(entry.id)) {
      errors.push(`Duplicate catalog entry id: "${entry.id}"`);
    }
    entryMap.set(entry.id, entry);
  }

  // Check dependencies existence & circular dependencies
  for (const entry of entries) {
    for (const depId of entry.dependencies) {
      if (!entryMap.has(depId)) {
        errors.push(`Entry "${entry.id}" depends on unknown entry "${depId}"`);
      }
    }
  }

  // Circular dependency check using DFS
  const visited = new Set();
  const recursionStack = new Set();

  function detectCycle(entryId, currentPath = []) {
    visited.add(entryId);
    recursionStack.add(entryId);

    const entry = entryMap.get(entryId);
    if (entry) {
      for (const depId of entry.dependencies) {
        if (!visited.has(depId)) {
          if (detectCycle(depId, [...currentPath, entryId])) return true;
        } else if (recursionStack.has(depId)) {
          errors.push(`Circular dependency detected: ${[...currentPath, entryId, depId].join(' -> ')}`);
          return true;
        }
      }
    }

    recursionStack.delete(entryId);
    return false;
  }

  for (const entry of entries) {
    if (!visited.has(entry.id)) {
      detectCycle(entry.id);
    }
  }

  // Verify file existence and path traversal safety if promptsRootDir is provided
  if (promptsRootDir) {
    for (const entry of entries) {
      for (const file of entry.files) {
        try {
          const resolvedSource = resolveSafePath(promptsRootDir, file.source);
          const exists = await fileExists(resolvedSource);
          if (!exists) {
            errors.push(`File missing on disk for entry "${entry.id}": "${file.source}"`);
          }
        } catch (err) {
          errors.push(`Path violation in entry "${entry.id}" source "${file.source}": ${err.message}`);
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

