import { Command } from 'commander';
import { listCommand } from '../commands/list.js';

export function createCli() {
  const program = new Command();

  program
    .name('engineering-standards')
    .description('Modular, customizable engineering standards and AI coding instruction toolkit.')
    .version('0.1.0');

  program
    .command('list')
    .description('Display available prompt categories, framework profiles, and dependencies.')
    .option('--json', 'Output list in machine-readable JSON format')
    .action(listCommand);

  program
    .command('init')
    .description('Initialize engineering standards in the current project.')
    .option('-i, --interactive', 'Run in interactive selection mode (default in TTY)')
    .option('-m, --mode <mode>', 'Instruction loading mode: minimal, standard, strict', 'standard')
    .option('--frontend', 'Install Frontend Engineering standards')
    .option('--backend', 'Install Backend Engineering standards')
    .option('--database', 'Install Database Engineering standards')
    .option('--security', 'Install Security Engineering standards')
    .option('--testing', 'Install Testing Engineering standards')
    .option('-p, --profile <profiles...>', 'Install one or more framework profiles')
    .option('-a, --adapter <adapters...>', 'Configure AI tool adapters (cursor, claude-code, copilot, generic)')
    .option('-d, --dir <directory>', 'Target directory', '.')
    .option('-y, --yes', 'Skip confirmation prompts')
    .action(async (options) => {
      const { initCommand } = await import('../commands/init.js');
      await initCommand(options);
    });

  program
    .command('add <target>')
    .description('Add a prompt category or framework profile to the current project.')
    .option('-d, --dir <directory>', 'Target project directory', '.')
    .action(async (target, options) => {
      const { addCommand } = await import('../commands/add.js');
      await addCommand(target, options);
    });

  program
    .command('remove <target>')
    .description('Remove a prompt category or framework profile from the current project.')
    .option('-d, --dir <directory>', 'Target project directory', '.')
    .action(async (target, options) => {
      const { removeCommand } = await import('../commands/remove.js');
      await removeCommand(target, options);
    });

  program
    .command('update')
    .description('Safely check for and apply updates to installed standards preserving custom edits.')
    .option('-d, --dir <directory>', 'Target project directory', '.')
    .option('--dry-run', 'Preview changes without modifying files')
    .option('--force', 'Force overwrite without three-way merge')
    .action(async (options) => {
      const { updateCommand } = await import('../commands/update.js');
      await updateCommand(options);
    });

  program
    .command('check')
    .description('Verify installation integrity, schema validity, and AI adapter references.')
    .option('-d, --dir <directory>', 'Target project directory', '.')
    .action(async (options) => {
      const { checkCommand } = await import('../commands/check.js');
      await checkCommand(options);
    });

  program
    .command('doctor')
    .description('Diagnose project configuration, framework detection, and AI integration status.')
    .option('-d, --dir <directory>', 'Target project directory', '.')
    .action(async (options) => {
      const { doctorCommand } = await import('../commands/doctor.js');
      await doctorCommand(options);
    });

  return program;
}

export function runCli(argv = process.argv) {
  const program = createCli();
  return program.parseAsync(argv);
}
