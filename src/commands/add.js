import path from 'node:path';
import pc from 'picocolors';
import { loadCatalog } from '../catalog/load-catalog.js';
import { installPrompts } from '../installer/install-prompts.js';
import { applyAdapters } from '../adapters/index.js';
import { FileManager } from '../installer/file-manager.js';
import { logger } from '../utils/logger.js';

/**
 * Adds an engineering category or framework profile to the current project.
 * @param {string} target Raw target identifier (e.g. "frontend", "mern", "profile:nextjs")
 * @param {object} options
 */
export async function addCommand(target, options = {}) {
  const projectRoot = path.resolve(options.dir || '.');

  try {
    const catalog = await loadCatalog({ verifyFiles: false });
    const fileManager = new FileManager(projectRoot);
    const existingConfig = await fileManager.readConfig();

    if (!existingConfig) {
      logger.error('No engineering standards installation found in this directory. Run "init" first.');
      process.exitCode = 1;
      return;
    }

    let targetId = target.trim();
    if (!catalog.entries.some(e => e.id === targetId)) {
      if (catalog.entries.some(e => e.id === `profile:${targetId}`)) {
        targetId = `profile:${targetId}`;
      } else {
        logger.error(`Unknown standard or profile: "${target}". Run "list" to see available options.`);
        process.exitCode = 1;
        return;
      }
    }

    logger.info(`Adding ${pc.bold(targetId)} to ${pc.bold(projectRoot)}...`);

    const result = await installPrompts({
      projectRoot,
      requestedIds: [targetId],
      adapters: existingConfig.adapters || ['generic'],
      force: false
    });

    const entryMap = new Map(catalog.entries.map(e => [e.id, e]));
    const installedEntries = result.installedIds.map(id => entryMap.get(id)).filter(Boolean);
    await applyAdapters(projectRoot, existingConfig.adapters || ['generic'], installedEntries);

    logger.success(`Successfully added ${pc.bold(targetId)}!`);
    console.log(`\n  ${pc.bold('Active Standards & Profiles:')}`);
    for (const id of result.installedIds) {
      console.log(`   - ${pc.cyan(id)}`);
    }
  } catch (err) {
    logger.error(`Failed to add standard: ${err.message}`, err);
    process.exitCode = 1;
  }
}

