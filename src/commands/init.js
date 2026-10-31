import path from 'node:path';
import pc from 'picocolors';
import { checkbox, select } from '@inquirer/prompts';
import { loadCatalog } from '../catalog/load-catalog.js';
import { installPrompts } from '../installer/install-prompts.js';
import { applyAdapters } from '../adapters/index.js';
import { detectProjectFrameworks } from '../detector/detect-framework.js';
import { logger } from '../utils/logger.js';

/**
 * Initializes engineering standards in the target project.
 * @param {object} options
 */
export async function initCommand(options = {}) {
  const projectRoot = path.resolve(options.dir || '.');

  try {
    const catalog = await loadCatalog({ verifyFiles: false });
    const detected = await detectProjectFrameworks(projectRoot);

    const isNonInteractive = options.frontend ||
      options.backend ||
      options.database ||
      options.security ||
      options.testing ||
      options.profile ||
      options.yes ||
      !process.stdin.isTTY;

    let selectedCategories = ['core'];
    let selectedProfiles = [];
    let selectedAdapters = options.adapter
      ? (Array.isArray(options.adapter) ? options.adapter : [options.adapter])
      : ['cursor', 'claude-code', 'copilot', 'generic'];
    let selectedMode = options.mode || 'standard';

    if (isNonInteractive) {
      if (options.frontend) selectedCategories.push('frontend');
      if (options.backend) selectedCategories.push('backend');
      if (options.database) selectedCategories.push('database');
      if (options.security) selectedCategories.push('security');
      if (options.testing) selectedCategories.push('testing');

      if (options.profile) {
        const rawProfiles = Array.isArray(options.profile) ? options.profile : [options.profile];
        for (const p of rawProfiles) {
          const id = p.startsWith('profile:') ? p : `profile:${p}`;
          selectedProfiles.push(id);
        }
      }
    } else {
      logger.heading('Engineering Standards — Interactive Setup');

      if (detected.summary.length > 0) {
        logger.info(`Detected project technologies: ${pc.bold(detected.summary.join(', '))}`);
      }

      // 1. Categories selection
      const categoryChoices = [
        { name: 'Core Engineering (Mandatory)', value: 'core', checked: true, disabled: true },
        { name: 'Frontend Engineering', value: 'frontend', checked: detected.detectedCategories.includes('frontend') },
        { name: 'Backend Engineering', value: 'backend', checked: detected.detectedCategories.includes('backend') },
        { name: 'Database Engineering', value: 'database', checked: detected.detectedCategories.includes('database') },
        { name: 'Security Engineering', value: 'security', checked: true },
        { name: 'Testing Engineering', value: 'testing', checked: detected.detectedCategories.includes('testing') }
      ];

      const chosenCats = await checkbox({
        message: 'Which engineering standard categories do you need?',
        choices: categoryChoices
      });
      selectedCategories = Array.from(new Set(['core', ...chosenCats]));

      // 2. Profiles selection
      const allProfiles = catalog.entries.filter(e => e.category === 'profile');
      const profileChoices = allProfiles.map(p => ({
        name: `${p.name} - ${pc.dim(p.description)}`,
        value: p.id,
        checked: detected.detectedProfiles.includes(p.id)
      }));

      selectedProfiles = await checkbox({
        message: 'Which framework profiles do you want to install?',
        choices: profileChoices
      });

      // 3. AI Adapters selection
      const adapterChoices = [
        { name: 'Cursor (.cursor/rules/)', value: 'cursor', checked: true },
        { name: 'Claude Code (CLAUDE.md)', value: 'claude-code', checked: true },
        { name: 'GitHub Copilot (.github/copilot-instructions.md)', value: 'copilot', checked: true },
        { name: 'Generic (AI_INSTRUCTIONS.md)', value: 'generic', checked: true }
      ];

      selectedAdapters = await checkbox({
        message: 'Which AI coding tool integrations should be configured?',
        choices: adapterChoices
      });

      // 4. Instruction loading mode
      selectedMode = await select({
        message: 'Select instruction loading mode (context efficiency):',
        choices: [
          { name: 'Standard (Recommended) — Progressive loading by domain', value: 'standard' },
          { name: 'Minimal — Concise core rules for lightweight tasks', value: 'minimal' },
          { name: 'Strict — Comprehensive security, architecture, and testing invariants', value: 'strict' }
        ],
        default: 'standard'
      });
    }

    const allRequestedIds = [...selectedCategories, ...selectedProfiles];

    logger.info(`Installing standards into ${pc.bold(projectRoot)}...`);

    const result = await installPrompts({
      projectRoot,
      requestedIds: allRequestedIds,
      adapters: selectedAdapters,
      mode: selectedMode,
      detectedSummary: detected.summary,
      force: false
    });

    // Configure selected AI tool adapters
    const entryMap = new Map(catalog.entries.map(e => [e.id, e]));
    const installedEntries = result.installedIds.map(id => entryMap.get(id)).filter(Boolean);
    await applyAdapters(projectRoot, selectedAdapters, installedEntries);

    logger.success(`Engineering standards successfully initialized!`);
    console.log(`\n  ${pc.bold('Instruction Mode:')} ${pc.cyan(result.config.mode)}`);
    console.log(`\n  ${pc.bold('Installed Categories & Profiles:')}`);
    for (const id of result.installedIds) {
      console.log(`   - ${pc.cyan(id)}`);
    }

    if (result.skippedModified.length > 0) {
      logger.warn(`Preserved ${result.skippedModified.length} locally modified file(s) without overwriting:`);
      for (const skipped of result.skippedModified) {
        console.log(`   - ${pc.yellow(skipped)}`);
      }
    }

    console.log(`\n  ${pc.bold('AI Tool Integrations Configured:')}`);
    for (const a of selectedAdapters) {
      console.log(`   - ${pc.green(a)}`);
    }

    console.log(`\nLiving Project Architecture Context: ${pc.bold('.engineering-standards/PROJECT_CONTEXT.md')}`);
    console.log(`Canonical standards location: ${pc.bold('.engineering-standards/')}`);
    console.log(`Manifest lockfile: ${pc.bold('.engineering-standards/manifest.lock.json')}\n`);
  } catch (err) {
    logger.error(`Initialization failed: ${err.message}`, err);
    process.exitCode = 1;
  }
}
