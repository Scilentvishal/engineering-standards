import { loadCatalog, getPromptsRoot } from '../src/catalog/load-catalog.js';
import { validateCatalog } from '../src/catalog/validate-catalog.js';
import { logger } from '../src/utils/logger.js';

async function main() {
  logger.info('Validating package catalog and prompt integrity...');

  const promptsDir = getPromptsRoot();
  const catalog = await loadCatalog({ verifyFiles: false });

  const result = await validateCatalog(catalog, promptsDir);

  if (!result.valid) {
    logger.error('Catalog validation failed with the following errors:');
    for (const err of result.errors) {
      console.error(`  - ${err}`);
    }
    process.exit(1);
  }

  logger.success(`Catalog verified successfully! (${catalog.entries.length} entries declared, all files present on disk)`);
}

main().catch(err => {
  logger.error(`Fatal validation error: ${err.message}`, err);
  process.exit(1);
});

