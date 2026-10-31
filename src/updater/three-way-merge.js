/**
 * Line-based three-way merge algorithm.
 * Merges local and upstream changes with respect to the common base snapshot.
 * 
 * @param {string} baseContent Original upstream base at install/last-update time
 * @param {string} localContent Developer's modified local file
 * @param {string} upstreamContent New incoming upstream prompt from updated package
 * @returns {{ mergedContent: string, hasConflicts: boolean, conflictDetails?: string }}
 */
export function threeWayMerge(baseContent, localContent, upstreamContent) {
  // Normalize line endings
  const base = baseContent.replace(/\r\n/g, '\n');
  const local = localContent.replace(/\r\n/g, '\n');
  const upstream = upstreamContent.replace(/\r\n/g, '\n');

  // Fast paths
  if (local === upstream) {
    return { mergedContent: local, hasConflicts: false };
  }
  if (base === local) {
    // Only upstream changed
    return { mergedContent: upstream, hasConflicts: false };
  }
  if (base === upstream) {
    // Only developer changed
    return { mergedContent: local, hasConflicts: false };
  }

  // Section/Chunk based 3-way merge
  const baseLines = base.split('\n');
  const localLines = local.split('\n');
  const upstreamLines = upstream.split('\n');

  // Break markdown into logical heading-delimited blocks (# , ## , ###)
  const parseBlocks = (lines) => {
    const blocks = [];
    let currentHeading = '__HEADER__';
    let currentLines = [];

    for (const line of lines) {
      if (/^#{1,4}\s+/.test(line)) {
        if (currentLines.length > 0) {
          blocks.push({ heading: currentHeading, content: currentLines.join('\n') });
          currentLines = [];
        }
        currentHeading = line.trim();
      }
      currentLines.push(line);
    }
    if (currentLines.length > 0) {
      blocks.push({ heading: currentHeading, content: currentLines.join('\n') });
    }
    return blocks;
  };

  const baseBlocks = parseBlocks(baseLines);
  const localBlocks = parseBlocks(localLines);
  const upstreamBlocks = parseBlocks(upstreamLines);

  const baseBlockMap = new Map(baseBlocks.map(b => [b.heading, b.content]));
  const localBlockMap = new Map(localBlocks.map(b => [b.heading, b.content]));
  const upstreamBlockMap = new Map(upstreamBlocks.map(b => [b.heading, b.content]));

  // Merge headings preserving order: start with local order, then append any new upstream blocks
  const allHeadings = [];
  for (const b of localBlocks) {
    allHeadings.push(b.heading);
  }
  for (const b of upstreamBlocks) {
    if (!allHeadings.includes(b.heading)) {
      allHeadings.push(b.heading);
    }
  }

  let hasConflicts = false;
  const mergedSections = [];
  const conflictLog = [];

  for (const heading of allHeadings) {
    const baseB = baseBlockMap.get(heading);
    const localB = localBlockMap.get(heading);
    const upB = upstreamBlockMap.get(heading);

    if (localB !== undefined && upB === undefined) {
      // Added locally or deleted upstream
      if (baseB !== undefined) {
        // Existed in base, upstream deleted it: if local also modified it -> conflict, else upstream delete wins
        if (localB !== baseB) {
          hasConflicts = true;
          conflictLog.push(`Section "${heading}": locally modified but deleted upstream.`);
          mergedSections.push(localB); // preserve local
        }
      } else {
        // Added locally by developer -> preserve local addition
        mergedSections.push(localB);
      }
    } else if (localB === undefined && upB !== undefined) {
      // Deleted locally or added upstream
      if (baseB !== undefined) {
        // Existed in base, local deleted it: if upstream also modified it -> conflict, else local delete wins
        if (upB !== baseB) {
          hasConflicts = true;
          conflictLog.push(`Section "${heading}": locally deleted but modified upstream.`);
          mergedSections.push(upB);
        }
      } else {
        // Newly added upstream -> accept upstream addition
        mergedSections.push(upB);
      }
    } else if (localB !== undefined && upB !== undefined) {
      // Present in both
      if (localB === upB) {
        mergedSections.push(localB);
      } else if (baseB === localB) {
        // Only upstream changed this section
        mergedSections.push(upB);
      } else if (baseB === upB) {
        // Only local changed this section
        mergedSections.push(localB);
      } else {
        // Both changed this section! Conflict!
        hasConflicts = true;
        conflictLog.push(`Section "${heading}": modified both locally and upstream.`);
        // Produce visible conflict marker block
        mergedSections.push([
          `<<<<<<< LOCAL (Your Edits)`,
          localB,
          `=======`,
          upB,
          `>>>>>>> UPSTREAM (Updated Standards)`
        ].join('\n'));
      }
    }
  }

  return {
    mergedContent: mergedSections.join('\n\n') + '\n',
    hasConflicts,
    conflictDetails: conflictLog.join('\n')
  };
}

