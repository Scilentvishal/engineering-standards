import fs from 'node:fs/promises';
import path from 'node:path';
import pc from 'picocolors';
import { loadCatalog } from '../catalog/load-catalog.js';
import { FileManager } from '../installer/file-manager.js';
import { applyAdapters } from '../adapters/index.js';
import { fileExists, resolveSafePath } from '../utils/paths.js';
import { logger } from '../utils/logger.js';

/**
 * Removes an engineering standard category or profile from the project.
 * @param {string} target
 * @param {object} options
 */
export async function removeCommand(target, options = {}) {
  const projectRoot = path.resolve(options.dir || '.');

  try {
    const catalog = await loadCatalog({ verifyFiles: false });
    const fileManager = new FileManager(projectRoot);
    const config = await fileManager.readConfig();
    const manifest = await fileManager.readManifest();

    if (!config || !manifest) {
      logger.error('No engineering standards installation found in this directory.');
      process.exitCode = 1;
      return;
    }

    let targetId = target.trim();
    if (!catalog.entries.some(e => e.id === targetId)) {
      if (catalog.entries.some(e => e.id === `profile:${targetId}`)) {
        targetId = `profile:${targetId}`;
      } else {
        logger.error(`Unknown standard or profile: "${target}".`);
        process.exitCode = 1;
        return;
      }
    }

    if (targetId === 'core') {
      logger.error('Cannot remove "core" engineering standards; core principles are mandatory.');
      process.exitCode = 1;
      return;
    }

    const currentInstalled = new Set([
      ...(config.categories || []),
      ...(config.profiles || [])
    ]);

    if (!currentInstalled.has(targetId)) {
      logger.warn(`Standard "${targetId}" is not currently installed.`);
      return;
    }

    // Check if other remaining entries depend on targetId
    const remainingCandidates = Array.from(currentInstalled).filter(id => id !== targetId);
    const entryMap = new Map(catalog.entries.map(e => [e.id, e]));

    for (const remId of remainingCandidates) {
      const entry = entryMap.get(remId);
      if (entry?.dependencies?.includes(targetId)) {
        logger.error(`Cannot remove "${targetId}" because installed entry "${remId}" depends on it. Remove "${remId}" first.`);
        process.exitCode = 1;
        return;
      }
    }

    logger.info(`Removing "${targetId}" from ${pc.bold(projectRoot)}...`);

    // Determine files to remove: files belonging to targetId that are NOT part of any remaining entry
    const targetEntry = entryMap.get(targetId);
    const remainingFiles = new Set();
    for (const remId of remainingCandidates) {
      const entry = entryMap.get(remId);
      if (entry) {
        for (const f of entry.files) {
          remainingFiles.add(f.target);
        }
      }
    }

    const removedFiles = [];
    if (targetEntry) {
      for (const f of targetEntry.files) {
        if (!remainingFiles.has(f.target)) {
          const filePath = resolveSafePath(fileManager.standardsDir, f.target);
          if (await fileExists(filePath)) {
            await fs.unlink(filePath);
            removedFiles.push(f.target);
          }
        }
      }
    }

    // Update config
    config.categories = config.categories.filter(c => c !== targetId);
    config.profiles = config.profiles.filter(p => p !== targetId);
    await fileManager.writeConfig(config);

    // Update manifest
    manifest.installedEntries = manifest.installedEntries.filter(e => e.id !== targetId);
    manifest.files = manifest.files.filter(f => !removedFiles.includes(f.target));
    manifest.updatedAt = new Date().toISOString();
    await fileManager.writeManifest(manifest);

    // Reapply adapters with remaining entries
    const remainingEntries = remainingCandidates.map(id => entryMap.get(id)).filter(Boolean);
    await applyAdapters(projectRoot, config.adapters || ['generic'], remainingEntries);

    logger.success(`Successfully removed "${targetId}".`);
    if (removedFiles.length > 0) {
      console.log(`  Removed unreferenced prompt files: ${removedFiles.join(', ')}`);
    }
  } catch (err) {
    logger.error(`Failed to remove standard: ${err.message}`, err);
    process.exitCode = 1;
  }
}

