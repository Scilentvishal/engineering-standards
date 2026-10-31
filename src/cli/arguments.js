/**
 * Helper to normalize and validate CLI arguments.
 */
export function parseTargetId(rawId) {
  if (!rawId || typeof rawId !== 'string') {
    return null;
  }
  const trimmed = rawId.trim().toLowerCase();
  return trimmed;
}

