import fs from 'node:fs/promises';
import path from 'node:path';
import { FileManager } from './file-manager.js';
import { ConflictResolver } from './conflict-resolver.js';
import { ensureProjectContext } from './project-context.js';
import { loadCatalog, getPromptsRoot } from '../catalog/load-catalog.js';
import { resolveDependencies } from '../catalog/resolve-dependencies.js';
import { hashContent } from '../utils/hashing.js';
import { resolveSafePath } from '../utils/paths.js';
import { logger } from '../utils/logger.js';

/**
 * Installs specified categories, profiles, and adapters into target project.
 * 
 * @param {object} params
 * @param {string} params.projectRoot
 * @param {string[]} params.requestedIds Category or profile IDs
 * @param {string[]} [params.adapters=[]] List of AI tool adapters
 * @param {string} [params.mode='standard'] Instruction loading mode: minimal, standard, strict
 * @param {string[]} [params.detectedSummary=[]]
 * @param {boolean} [params.force=false] Overwrite local modifications if true
 * @returns {Promise<{ installedIds: string[], filesWritten: string[], skippedModified: string[], config: object, manifest: object }>}
 */
export async function installPrompts({
  projectRoot,
  requestedIds,
  adapters = ['generic'],
  mode = 'standard',
  detectedSummary = [],
  force = false
}) {
  const catalog = await loadCatalog({ verifyFiles: true });
  const fileManager = new FileManager(projectRoot);
  const conflictResolver = new ConflictResolver(fileManager);
  await fileManager.ensureStandardsDir();

  const promptsRootDir = getPromptsRoot();
  const existingConfig = await fileManager.readConfig();
  const existingManifest = await fileManager.readManifest();

  // Combine with previously installed entries if updating/adding
  const allRequested = new Set(requestedIds);
  if (existingConfig) {
    for (const c of existingConfig.categories || []) allRequested.add(c);
    for (const p of existingConfig.profiles || []) allRequested.add(p);
  }

  const resolvedIds = resolveDependencies(Array.from(allRequested), catalog.entries);
  const entryMap = new Map(catalog.entries.map(e => [e.id, e]));

  const filesWritten = [];
  const skippedModified = [];
  const manifestFiles = existingManifest?.files ? [...existingManifest.files] : [];

  for (const id of resolvedIds) {
    const entry = entryMap.get(id);
    if (!entry) continue;

    for (const fileSpec of entry.files) {
      const sourcePath = resolveSafePath(promptsRootDir, fileSpec.source);
      const content = await fs.readFile(sourcePath, 'utf8');
      const incomingHash = hashContent(content);

      const status = await conflictResolver.assessFileStatus(fileSpec, content, existingManifest);

      if (status.status === 'modified-locally' && !force) {
        skippedModified.push(fileSpec.target);
        const idx = manifestFiles.findIndex(f => f.target === fileSpec.target);
        if (idx === -1) {
          manifestFiles.push({
            id: fileSpec.id,
            source: fileSpec.source,
            target: fileSpec.target,
            baseHash: incomingHash,
            updatedAt: new Date().toISOString()
          });
        }
        continue;
      }

      // Write prompt file to canonical standards directory
      await fileManager.writeStandardsFile(fileSpec.target, content);
      // Save upstream snapshot for 3-way merge capabilities
      await fileManager.writeUpstreamSnapshot(fileSpec.id, content);
      filesWritten.push(fileSpec.target);

      const existingIdx = manifestFiles.findIndex(f => f.target === fileSpec.target);
      const fileRecord = {
        id: fileSpec.id,
        source: fileSpec.source,
        target: fileSpec.target,
        baseHash: incomingHash,
        installedAt: new Date().toISOString()
      };

      if (existingIdx >= 0) {
        manifestFiles[existingIdx] = fileRecord;
      } else {
        manifestFiles.push(fileRecord);
      }
    }
  }

  // Segregate installed categories and profiles
  const installedCategories = [];
  const installedProfiles = [];

  for (const id of resolvedIds) {
    const entry = entryMap.get(id);
    if (entry?.category === 'profile') {
      installedProfiles.push(id);
    } else {
      installedCategories.push(id);
    }
  }

  // Ensure PROJECT_CONTEXT.md is created if not already present
  await ensureProjectContext(projectRoot, {
    detectedSummary,
    categories: installedCategories,
    profiles: installedProfiles
  });

  const selectedMode = ['minimal', 'standard', 'strict'].includes(mode)
    ? mode
    : (existingConfig?.mode || 'standard');

  const config = {
    version: '1.0.0',
    mode: selectedMode,
    categories: installedCategories,
    profiles: installedProfiles,
    adapters: Array.from(new Set(adapters)),
    updatePreferences: {
      autoBackup: true,
      strategy: 'three-way'
    },
    customSettings: existingConfig?.customSettings || {}
  };

  const manifest = {
    packageVersion: '0.1.0',
    installedEntries: resolvedIds.map(id => {
      const entry = entryMap.get(id);
      return { id, version: entry.version };
    }),
    files: manifestFiles,
    generatedAt: new Date().toISOString()
  };

  await fileManager.writeConfig(config);
  await fileManager.writeManifest(manifest);

  return {
    installedIds: resolvedIds,
    filesWritten,
    skippedModified,
    config,
    manifest
  };
}
