import path from 'node:path';
import pc from 'picocolors';
import { UpdateManager } from '../updater/update-manager.js';
import { logger } from '../utils/logger.js';

/**
 * Updates installed engineering standards safely.
 * @param {object} options
 */
export async function updateCommand(options = {}) {
  const projectRoot = path.resolve(options.dir || '.');

  try {
    const updateManager = new UpdateManager(projectRoot);
    logger.heading('Engineering Standards — Safe Update Engine');

    if (options.dryRun) {
      logger.info('Running in DRY-RUN mode. No files will be modified.');
    }

    const result = await updateManager.executeUpdate({
      dryRun: Boolean(options.dryRun),
      force: Boolean(options.force)
    });

    if (result.backupDir) {
      logger.success(`Safety backup created at: ${pc.bold(result.backupDir)}`);
    }

    if (result.updatedFiles.length > 0) {
      console.log(`\n  ${pc.green(pc.bold('Updated Upstream Prompts:'))}`);
      for (const f of result.updatedFiles) {
        console.log(`   ✔ ${f}`);
      }
    }

    if (result.cleanMergedFiles.length > 0) {
      console.log(`\n  ${pc.cyan(pc.bold('Cleanly Merged (Custom Edits + Upstream Updates):'))}`);
      for (const f of result.cleanMergedFiles) {
        console.log(`   ✔ ${f}`);
      }
    }

    if (result.conflictedFiles.length > 0) {
      console.log(`\n  ${pc.yellow(pc.bold('Conflicts Detected (Local Modifications Preserved):'))}`);
      for (const c of result.conflictDetails) {
        console.log(`   ⚠ ${c.target}`);
        if (c.details) {
          console.log(`     ${pc.dim(c.details)}`);
        }
        console.log(`     ${pc.dim(`Proposed merge saved to: ${c.target}.proposed`)}`);
      }
    }

    if (result.updatedFiles.length === 0 && result.cleanMergedFiles.length === 0 && result.conflictedFiles.length === 0) {
      logger.success('All installed engineering standards are already up to date!');
    } else {
      logger.success('Update completed safely.');
    }
  } catch (err) {
    logger.error(`Update failed: ${err.message}`, err);
    process.exitCode = 1;
  }
}

