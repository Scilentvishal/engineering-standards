import { fileExists, resolveSafePath } from '../utils/paths.js';
import { hashFile, hashContent } from '../utils/hashing.js';

export class ConflictResolver {
  /**
   * @param {import('./file-manager.js').FileManager} fileManager
   */
  constructor(fileManager) {
    this.fileManager = fileManager;
  }

  /**
   * Analyzes an incoming file against the existing destination file and manifest.
   * 
   * @param {object} fileSpec
   * @param {string} incomingContent
   * @param {object} [manifest]
   * @returns {Promise<{ status: 'clean' | 'unchanged' | 'modified-locally' | 'new', baseHash?: string }>}
   */
  async assessFileStatus(fileSpec, incomingContent, manifest) {
    const dest = resolveSafePath(this.fileManager.standardsDir, fileSpec.target);
    const exists = await fileExists(dest);

    if (!exists) {
      return { status: 'new' };
    }

    const currentHash = await hashFile(dest);
    const incomingHash = hashContent(incomingContent);

    if (currentHash === incomingHash) {
      return { status: 'unchanged', baseHash: incomingHash };
    }

    // If manifest tracks this file, check if local differs from recorded baseHash
    const tracked = manifest?.files?.find(f => f.id === fileSpec.id || f.target === fileSpec.target);
    if (tracked && tracked.baseHash) {
      if (currentHash !== tracked.baseHash) {
        return { status: 'modified-locally', baseHash: tracked.baseHash };
      }
    }

    // File exists but does not match incoming content
    return { status: 'modified-locally', baseHash: currentHash };
  }
}

