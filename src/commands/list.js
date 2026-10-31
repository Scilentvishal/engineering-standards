import pc from 'picocolors';
import { loadCatalog } from '../catalog/load-catalog.js';
import { logger } from '../utils/logger.js';

/**
 * Executes the list command.
 * @param {object} options
 * @param {boolean} [options.json]
 */
export async function listCommand(options = {}) {
  try {
    const catalog = await loadCatalog({ verifyFiles: false });

    if (options.json) {
      console.log(JSON.stringify(catalog, null, 2));
      return;
    }

    logger.heading('Engineering Standards — Available Standards & Profiles');
    logger.dim(`Catalog Version: ${catalog.version}\n`);

    const categories = catalog.entries.filter(e => e.category !== 'profile');
    const profiles = catalog.entries.filter(e => e.category === 'profile');

    logger.subheading('Standard Categories:');
    for (const cat of categories) {
      console.log(`  ${pc.cyan(pc.bold(cat.id.padEnd(12)))} ${cat.name}`);
      console.log(`    ${pc.dim(cat.description)}`);
      if (cat.dependencies.length > 0) {
        console.log(`    ${pc.yellow('Dependencies:')} ${cat.dependencies.join(', ')}`);
      }
      console.log(`    ${pc.dim('Files:')} ${cat.files.map(f => f.target).join(', ')}`);
      console.log('');
    }

    logger.subheading('Framework & Technology Profiles:');
    for (const prof of profiles) {
      console.log(`  ${pc.magenta(pc.bold(prof.id.padEnd(24)))} ${prof.name}`);
      console.log(`    ${pc.dim(prof.description)}`);
      if (prof.dependencies.length > 0) {
        console.log(`    ${pc.yellow('Dependencies:')} ${prof.dependencies.join(', ')}`);
      }
      console.log(`    ${pc.dim('Files:')} ${prof.files.map(f => f.target).join(', ')}`);
      console.log('');
    }

    logger.log(pc.dim('To initialize engineering standards in your project:'));
    logger.log(`  ${pc.green('npx engineering-standards init')}\n`);
  } catch (err) {
    logger.error(`Failed to list engineering standards: ${err.message}`, err);
    process.exitCode = 1;
  }
}

