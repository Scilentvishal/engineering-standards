import path from 'node:path';
import pc from 'picocolors';
import { FileManager } from '../installer/file-manager.js';
import { detectProject } from '../detector/detect-project.js';
import { detectProjectFrameworks } from '../detector/detect-framework.js';
import { loadCatalog } from '../catalog/load-catalog.js';
import { logger } from '../utils/logger.js';

/**
 * Runs deep diagnostic analysis of the project integration.
 * @param {object} options
 */
export async function doctorCommand(options = {}) {
  const projectRoot = path.resolve(options.dir || '.');
  const fileManager = new FileManager(projectRoot);

  logger.heading('Engineering Standards — Doctor Diagnostics');

  // 1. Runtime environment
  const nodeVersion = process.version;
  console.log(`  ${pc.bold('Node.js Version:')} ${nodeVersion} (${parseInt(nodeVersion.slice(1)) >= 20 ? pc.green('Compatible') : pc.yellow('Node 20+ Recommended')})`);
  console.log(`  ${pc.bold('Platform:')} ${process.platform} (${process.arch})`);

  // 2. Project structure inspection
  const projectInfo = await detectProject(projectRoot);
  console.log(`  ${pc.bold('Project Root:')} ${projectInfo.root}`);
  console.log(`  ${pc.bold('Git Repository:')} ${projectInfo.hasGit ? pc.green('Yes') : pc.yellow('No (git recommended for prompt version control)')}`);
  console.log(`  ${pc.bold('Monorepo:')} ${projectInfo.isMonorepo ? pc.cyan('Yes') : 'No'}`);
  console.log(`  ${pc.bold('Package Manager:')} ${projectInfo.packageManager}`);

  // 3. Standards configuration
  const config = await fileManager.readConfig();
  const manifest = await fileManager.readManifest();

  if (!config || !manifest) {
    logger.warn('\nEngineering standards not initialized in this project.');
    console.log(`  Run: ${pc.green('npx engineering-standards init')} to set up.\n`);
    return;
  }

  console.log(`\n  ${pc.bold('Instruction Mode:')} ${config.mode || 'standard'}`);
  console.log(`  ${pc.bold('Installed Categories:')} ${config.categories.join(', ')}`);
  console.log(`  ${pc.bold('Installed Profiles:')} ${config.profiles.length > 0 ? config.profiles.join(', ') : 'None'}`);
  console.log(`  ${pc.bold('Configured AI Tools:')} ${config.adapters.join(', ')}`);

  // 4. Framework profile recommendations
  const frameworkDetections = await detectProjectFrameworks(projectRoot);
  const currentProfiles = new Set(config.profiles || []);
  const missingProfiles = frameworkDetections.detectedProfiles.filter(p => !currentProfiles.has(p));

  if (missingProfiles.length > 0) {
    console.log(`\n  ${pc.cyan(pc.bold('Recommended Framework Profiles:'))}`);
    for (const p of missingProfiles) {
      console.log(`   💡 Detected in codebase: ${pc.yellow(p)}`);
      console.log(`      Install with: ${pc.green(`npx engineering-standards add ${p}`)}`);
    }
  }

  logger.success('\nDoctor diagnostics complete.');
}
