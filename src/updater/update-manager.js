import fs from 'node:fs/promises';
import path from 'node:path';
import { FileManager } from '../installer/file-manager.js';
import { loadCatalog, getPromptsRoot } from '../catalog/load-catalog.js';
import { threeWayMerge } from './three-way-merge.js';
import { resolveSafePath, fileExists } from '../utils/paths.js';
import { hashContent } from '../utils/hashing.js';

export class UpdateManager {
  /**
   * @param {string} projectRoot
   */
  constructor(projectRoot) {
    this.projectRoot = path.resolve(projectRoot);
    this.fileManager = new FileManager(projectRoot);
  }

  /**
   * Plans and performs updates to installed prompts.
   * 
   * @param {object} [options]
   * @param {boolean} [options.dryRun=false]
   * @param {boolean} [options.force=false]
   * @returns {Promise<{
   *   updatedFiles: string[],
   *   cleanMergedFiles: string[],
   *   conflictedFiles: string[],
   *   unchangedFiles: string[],
   *   backupDir?: string
   * }>}
   */
  async executeUpdate(options = {}) {
    const catalog = await loadCatalog({ verifyFiles: true });
    const config = await this.fileManager.readConfig();
    const manifest = await this.fileManager.readManifest();

    if (!config || !manifest) {
      throw new Error('No engineering standards installation found in this project.');
    }

    const promptsRootDir = getPromptsRoot();
    const entryMap = new Map(catalog.entries.map(e => [e.id, e]));

    const installedIds = new Set([
      ...(config.categories || []),
      ...(config.profiles || [])
    ]);

    const updatedFiles = [];
    const cleanMergedFiles = [];
    const conflictedFiles = [];
    const unchangedFiles = [];
    const pendingWrites = [];

    for (const id of installedIds) {
      const entry = entryMap.get(id);
      if (!entry) continue;

      for (const fileSpec of entry.files) {
        const upstreamPath = resolveSafePath(promptsRootDir, fileSpec.source);
        const upstreamContent = await fs.readFile(upstreamPath, 'utf8');
        const upstreamHash = hashContent(upstreamContent);

        const localPath = resolveSafePath(this.fileManager.standardsDir, fileSpec.target);
        if (!(await fileExists(localPath))) {
          // File was missing locally: restore from upstream
          pendingWrites.push({
            target: fileSpec.target,
            id: fileSpec.id,
            content: upstreamContent,
            upstreamHash,
            type: 'restored'
          });
          continue;
        }

        const localContent = await fs.readFile(localPath, 'utf8');
        const localHash = hashContent(localContent);

        let baseContent = await this.fileManager.readUpstreamSnapshot(fileSpec.id);
        if (!baseContent) {
          // Fallback to recorded manifest baseHash if match, or current upstream
          baseContent = upstreamContent;
        }

        const baseHash = hashContent(baseContent);

        if (localHash === upstreamHash) {
          unchangedFiles.push(fileSpec.target);
          continue;
        }

        if (baseHash === localHash) {
          // Only upstream changed -> clean upstream update
          pendingWrites.push({
            target: fileSpec.target,
            id: fileSpec.id,
            content: upstreamContent,
            upstreamHash,
            type: 'upstream-update'
          });
          continue;
        }

        if (baseHash === upstreamHash) {
          // Only local changed -> preserve developer's modification
          unchangedFiles.push(fileSpec.target);
          continue;
        }

        // Both changed -> 3-way merge
        if (options.force) {
          pendingWrites.push({
            target: fileSpec.target,
            id: fileSpec.id,
            content: upstreamContent,
            upstreamHash,
            type: 'forced'
          });
          continue;
        }

        const mergeResult = threeWayMerge(baseContent, localContent, upstreamContent);
        if (mergeResult.hasConflicts) {
          conflictedFiles.push({
            target: fileSpec.target,
            details: mergeResult.conflictDetails,
            proposedContent: mergeResult.mergedContent
          });
          // In conflict, preserve local file as primary, write proposed merge to .proposed
          if (!options.dryRun) {
            await this.fileManager.writeStandardsFile(
              fileSpec.target + '.proposed',
              mergeResult.mergedContent
            );
          }
        } else {
          pendingWrites.push({
            target: fileSpec.target,
            id: fileSpec.id,
            content: mergeResult.mergedContent,
            upstreamHash,
            type: 'clean-merged'
          });
        }
      }
    }

    let backupDir = null;
    if (!options.dryRun && pendingWrites.length > 0) {
      backupDir = await this.fileManager.createBackup();
      const updatedManifestFiles = [...(manifest.files || [])];

      for (const item of pendingWrites) {
        await this.fileManager.writeStandardsFile(item.target, item.content);
        await this.fileManager.writeUpstreamSnapshot(item.id, item.content);

        if (item.type === 'clean-merged') {
          cleanMergedFiles.push(item.target);
        } else {
          updatedFiles.push(item.target);
        }

        const idx = updatedManifestFiles.findIndex(f => f.target === item.target);
        const record = {
          id: item.id,
          target: item.target,
          baseHash: item.upstreamHash,
          updatedAt: new Date().toISOString()
        };
        if (idx >= 0) {
          updatedManifestFiles[idx] = record;
        } else {
          updatedManifestFiles.push(record);
        }
      }

      manifest.files = updatedManifestFiles;
      manifest.updatedAt = new Date().toISOString();
      await this.fileManager.writeManifest(manifest);
    } else if (options.dryRun) {
      for (const item of pendingWrites) {
        if (item.type === 'clean-merged') {
          cleanMergedFiles.push(item.target);
        } else {
          updatedFiles.push(item.target);
        }
      }
    }

    return {
      updatedFiles,
      cleanMergedFiles,
      conflictedFiles: conflictedFiles.map(c => typeof c === 'string' ? c : c.target),
      conflictDetails: conflictedFiles,
      unchangedFiles,
      backupDir
    };
  }
}

