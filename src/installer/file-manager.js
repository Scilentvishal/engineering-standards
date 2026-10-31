import fs from 'node:fs/promises';
import path from 'node:path';
import { fileExists, resolveSafePath } from '../utils/paths.js';
import { hashFile, hashContent } from '../utils/hashing.js';

export class FileManager {
  /**
   * @param {string} projectRoot
   */
  constructor(projectRoot) {
    this.projectRoot = path.resolve(projectRoot);
    this.standardsDir = path.resolve(this.projectRoot, '.engineering-standards');
    this.upstreamBaseDir = path.resolve(this.standardsDir, '.upstream-base');
  }

  /**
   * Ensures the .engineering-standards directory and subdirectories exist.
   */
  async ensureStandardsDir() {
    await fs.mkdir(this.standardsDir, { recursive: true });
    await fs.mkdir(this.upstreamBaseDir, { recursive: true });
  }

  /**
   * Writes content safely inside the standards directory.
   * @param {string} relativeTargetPath
   * @param {string} content
   * @returns {Promise<string>} absolute path written to
   */
  async writeStandardsFile(relativeTargetPath, content) {
    const dest = resolveSafePath(this.standardsDir, relativeTargetPath);
    await fs.mkdir(path.dirname(dest), { recursive: true });
    await fs.writeFile(dest, content, 'utf8');
    return dest;
  }

  /**
   * Writes the original upstream snapshot to .upstream-base for 3-way merge tracking.
   * @param {string} fileId
   * @param {string} content
   */
  async writeUpstreamSnapshot(fileId, content) {
    // Sanitize fileId for filesystem safety
    const safeId = fileId.replace(/[^a-zA-Z0-9_-]/g, '_') + '.md';
    const dest = resolveSafePath(this.upstreamBaseDir, safeId);
    await fs.mkdir(path.dirname(dest), { recursive: true });
    await fs.writeFile(dest, content, 'utf8');
    return dest;
  }

  /**
   * Reads an upstream base snapshot.
   * @param {string} fileId
   * @returns {Promise<string|null>}
   */
  async readUpstreamSnapshot(fileId) {
    const safeId = fileId.replace(/[^a-zA-Z0-9_-]/g, '_') + '.md';
    const snapshotPath = resolveSafePath(this.upstreamBaseDir, safeId);
    if (await fileExists(snapshotPath)) {
      return fs.readFile(snapshotPath, 'utf8');
    }
    return null;
  }

  /**
   * Checks if an installed standards file exists and whether it has been modified locally.
   * @param {string} relativeTargetPath
   * @param {string} baseHash
   * @returns {Promise<{ exists: boolean, modified: boolean, currentHash?: string }>}
   */
  async checkModification(relativeTargetPath, baseHash) {
    const filePath = resolveSafePath(this.standardsDir, relativeTargetPath);
    if (!(await fileExists(filePath))) {
      return { exists: false, modified: false };
    }

    const currentHash = await hashFile(filePath);
    return {
      exists: true,
      modified: currentHash !== baseHash,
      currentHash
    };
  }

  /**
   * Reads config.json if present.
   * @returns {Promise<object|null>}
   */
  async readConfig() {
    const configPath = resolveSafePath(this.standardsDir, 'config.json');
    if (!(await fileExists(configPath))) return null;
    const content = await fs.readFile(configPath, 'utf8');
    return JSON.parse(content);
  }

  /**
   * Writes config.json.
   * @param {object} config
   */
  async writeConfig(config) {
    await this.ensureStandardsDir();
    const configPath = resolveSafePath(this.standardsDir, 'config.json');
    await fs.writeFile(configPath, JSON.stringify(config, null, 2) + '\n', 'utf8');
  }

  /**
   * Reads manifest.lock.json if present.
   * @returns {Promise<object|null>}
   */
  async readManifest() {
    const manifestPath = resolveSafePath(this.standardsDir, 'manifest.lock.json');
    if (!(await fileExists(manifestPath))) return null;
    const content = await fs.readFile(manifestPath, 'utf8');
    return JSON.parse(content);
  }

  /**
   * Writes manifest.lock.json.
   * @param {object} manifest
   */
  async writeManifest(manifest) {
    await this.ensureStandardsDir();
    const manifestPath = resolveSafePath(this.standardsDir, 'manifest.lock.json');
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  }

  /**
   * Creates a timestamped backup of the .engineering-standards directory.
   * @returns {Promise<string>} backup directory path
   */
  async createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = resolveSafePath(this.projectRoot, `.engineering-standards.backup-${timestamp}`);
    await fs.cp(this.standardsDir, backupDir, { recursive: true });
    return backupDir;
  }
}

