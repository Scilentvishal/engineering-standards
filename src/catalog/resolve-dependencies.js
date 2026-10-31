/**
 * Resolves all required dependencies for a requested set of entry IDs using topological sort.
 * Automatically guarantees 'core' is included if present in the catalog.
 * 
 * @param {string[]} requestedIds
 * @param {Map<string, import('./validate-catalog.js').CatalogEntrySchema> | object[]} catalogEntries
 * @returns {string[]} Ordered list of IDs from dependencies to dependents
 */
export function resolveDependencies(requestedIds, catalogEntries) {
  const entryMap = Array.isArray(catalogEntries)
    ? new Map(catalogEntries.map(e => [e.id, e]))
    : catalogEntries;

  const targetIds = new Set(requestedIds);
  if (entryMap.has('core')) {
    targetIds.add('core');
  }

  // Expand transitive dependencies
  const toProcess = Array.from(targetIds);
  while (toProcess.length > 0) {
    const currentId = toProcess.pop();
    const entry = entryMap.get(currentId);
    if (!entry) {
      throw new Error(`Catalog entry not found: "${currentId}"`);
    }

    for (const depId of entry.dependencies || []) {
      if (!targetIds.has(depId)) {
        targetIds.add(depId);
        toProcess.push(depId);
      }
    }
  }

  // Topological sorting (Kahn's algorithm)
  const inDegree = new Map();
  const graph = new Map();

  for (const id of targetIds) {
    inDegree.set(id, 0);
    graph.set(id, []);
  }

  for (const id of targetIds) {
    const entry = entryMap.get(id);
    for (const depId of entry.dependencies || []) {
      if (targetIds.has(depId)) {
        // depId must come before id, so edge: depId -> id
        graph.get(depId).push(id);
        inDegree.set(id, (inDegree.get(id) || 0) + 1);
      }
    }
  }

  const queue = [];
  for (const [id, deg] of inDegree.entries()) {
    if (deg === 0) {
      queue.push(id);
    }
  }

  // Ensure 'core' is first among independent entries if possible
  queue.sort((a, b) => {
    if (a === 'core') return -1;
    if (b === 'core') return 1;
    return a.localeCompare(b);
  });

  const sorted = [];
  while (queue.length > 0) {
    const current = queue.shift();
    sorted.push(current);

    for (const neighbor of graph.get(current) || []) {
      const newDeg = inDegree.get(neighbor) - 1;
      inDegree.set(neighbor, newDeg);
      if (newDeg === 0) {
        queue.push(neighbor);
      }
    }
  }

  if (sorted.length !== targetIds.size) {
    throw new Error('Cyclic dependency detected during dependency resolution.');
  }

  return sorted;
}

