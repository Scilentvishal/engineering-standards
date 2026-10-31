import fs from 'node:fs/promises';
import path from 'node:path';
import { fileExists, resolveSafePath } from '../utils/paths.js';

/**
 * Generates an initial PROJECT_CONTEXT.md file if one does not already exist.
 * 
 * @param {string} projectRoot
 * @param {object} [contextInfo]
 * @param {string[]} [contextInfo.detectedSummary=[]]
 * @param {string[]} [contextInfo.categories=[]]
 * @param {string[]} [contextInfo.profiles=[]]
 * @returns {Promise<{ created: boolean, path: string }>}
 */
export async function ensureProjectContext(projectRoot, contextInfo = {}) {
  const standardsDir = resolveSafePath(projectRoot, '.engineering-standards');
  const contextPath = resolveSafePath(standardsDir, 'PROJECT_CONTEXT.md');

  if (await fileExists(contextPath)) {
    return { created: false, path: contextPath };
  }

  const detectedTech = (contextInfo.detectedSummary || []).length > 0
    ? contextInfo.detectedSummary.join(', ')
    : 'Standard application codebase';

  const initialContent = `# Project Context & Architecture Register

> [!NOTE]
> This document maintains the living project architecture, directory structure, and reusable building blocks.
> **AI Coding Agents**: Consult this document before implementing features. When introducing new reusable components, hooks, or API clients, update the corresponding register below. Always verify details against current source files.

---

## 1. Technology Stack
- **Detected Technologies**: ${detectedTech}
- **Active Disciplines**: ${(contextInfo.categories || ['core']).join(', ')}
- **Framework Profiles**: ${(contextInfo.profiles || []).length > 0 ? contextInfo.profiles.join(', ') : 'None'}

---

## 2. Directory Structure & Key Paths
\`\`\`text
src/
├── components/          # Reusable UI components
├── hooks/               # Custom hooks
├── services/            # Business domain services
├── api/                 # API client definitions & fetchers
├── models/              # Data schemas / ORM models
└── utils/               # Shared helper functions
\`\`\`

---

## 3. Reusable Component Register
*List shared components here so AI agents discover and reuse them instead of recreating duplicates.*
- *(Add reusable components as they are built, e.g. \`<Button />\`, \`<Modal />\`, \`<Table />\`)*

---

## 4. Custom Hook Register
*List reusable stateful hooks.*
- *(Add custom hooks as they are built, e.g. \`useDebounce\`, \`useAuth\`, \`usePagination\`)*

---

## 5. API Client & Data Access
- **API Client Location**: \`src/api/\`
- **Error Envelope Format**: \`{ success: boolean, data?: any, error?: { code, message } }\`
- **Request Cancellation**: Support \`AbortSignal\` on queries.

---

## 6. Database & Persistence Layer
- **Database Engine / ORM**: Documented in active profiles.
- **Critical Performance Mandate**: All filtering, sorting, searching, and pagination must be executed in database queries, never in application runtime memory.

---

## 7. Project Conventions
- **Naming**: camelCase for functions/variables, PascalCase for components/types.
- **Testing**: Co-locate unit tests alongside source files (\`*.test.ts\` or \`*.spec.ts\`).
`;

  await fs.mkdir(standardsDir, { recursive: true });
  await fs.writeFile(contextPath, initialContent, 'utf8');

  return { created: true, path: contextPath };
}

