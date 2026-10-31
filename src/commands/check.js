import path from 'node:path';
import fs from 'node:fs/promises';
import pc from 'picocolors';
import { FileManager } from '../installer/file-manager.js';
import { fileExists, resolveSafePath } from '../utils/paths.js';
import { hashFile } from '../utils/hashing.js';
import { logger } from '../utils/logger.js';

/**
 * Checks configuration, manifest consistency, and missing files.
 * @param {object} options
 */
export async function checkCommand(options = {}) {
  const projectRoot = path.resolve(options.dir || '.');
  const fileManager = new FileManager(projectRoot);

  logger.heading('Engineering Standards — Installation Health Check');

  const config = await fileManager.readConfig();
  if (!config) {
    logger.error('No .engineering-standards/config.json found. Project is not initialized.');
    process.exitCode = 1;
    return;
  }

  const manifest = await fileManager.readManifest();
  if (!manifest) {
    logger.error('No .engineering-standards/manifest.lock.json found.');
    process.exitCode = 1;
    return;
  }

  const issues = [];
  const modifiedFiles = [];
  const verifiedFiles = [];

  // Check manifest files on disk
  for (const f of manifest.files || []) {
    const filePath = resolveSafePath(fileManager.standardsDir, f.target);
    if (!(await fileExists(filePath))) {
      issues.push(`Missing prompt file: ${f.target}`);
      continue;
    }

    const currentHash = await hashFile(filePath);
    if (f.baseHash && currentHash !== f.baseHash) {
      modifiedFiles.push(f.target);
    } else {
      verifiedFiles.push(f.target);
    }
  }

  // Check living project context file
  const projectContextPath = resolveSafePath(fileManager.standardsDir, 'PROJECT_CONTEXT.md');
  if (!(await fileExists(projectContextPath))) {
    issues.push('Missing .engineering-standards/PROJECT_CONTEXT.md architecture context file.');
  }

  // Check AI integration files
  const adapters = config.adapters || [];
  if (adapters.includes('cursor')) {
    const cursorDir = path.resolve(projectRoot, '.cursor/rules');
    if (!(await fileExists(cursorDir))) {
      issues.push('Cursor adapter is enabled, but .cursor/rules directory is missing.');
    }
  }

  if (adapters.includes('claude-code') || adapters.includes('claude')) {
    const claudeFile = path.resolve(projectRoot, 'CLAUDE.md');
    if (!(await fileExists(claudeFile))) {
      issues.push('Claude Code adapter is enabled, but CLAUDE.md is missing.');
    }
  }

  if (adapters.includes('copilot')) {
    const copilotFile = path.resolve(projectRoot, '.github/copilot-instructions.md');
    if (!(await fileExists(copilotFile))) {
      issues.push('GitHub Copilot adapter is enabled, but .github/copilot-instructions.md is missing.');
    }
  }

  if (adapters.includes('generic')) {
    const genericFile = path.resolve(projectRoot, 'AI_INSTRUCTIONS.md');
    if (!(await fileExists(genericFile))) {
      issues.push('Generic adapter is enabled, but AI_INSTRUCTIONS.md is missing.');
    }
  }

  console.log(`  ${pc.bold('Standards Checked:')} ${verifiedFiles.length + modifiedFiles.length} file(s)`);
  console.log(`  ${pc.green('Unmodified Upstream Files:')} ${verifiedFiles.length}`);
  console.log(`  ${pc.yellow('Locally Customized Files:')} ${modifiedFiles.length}`);

  if (modifiedFiles.length > 0) {
    console.log(`\n  ${pc.yellow('Customized files (protected from silent overwrite):')}`);
    for (const m of modifiedFiles) {
      console.log(`   - ${m}`);
    }
  }

  if (issues.length > 0) {
    logger.error(`\nFound ${issues.length} issue(s):`);
    for (const issue of issues) {
      console.log(`   ✖ ${pc.red(issue)}`);
    }
    process.exitCode = 1;
  } else {
    logger.success('\nInstallation is completely healthy and consistent!');
  }
}
