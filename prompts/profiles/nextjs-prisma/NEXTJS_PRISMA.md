# Next.js + Prisma Engineering Profile

## 1. Architecture & Singleton Client
- **Prisma Client Singleton**: In development with Next.js fast-refresh, prevent exhausting database connections by instantiating Prisma Client as a singleton attached to `globalThis`.
```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

## 2. Server Components & Server Actions
- Call Prisma queries directly inside React Server Components and Server Actions.
- Wrap mutations in Server Actions with Zod input validation and call `revalidatePath` upon completion.
- Never import the `prisma` client into Client Components (`'use client'`). Enforce with `import 'server-only'`.
- Query with strict `select` projections and database-level `where`, `orderBy`, and `take`/`skip`/`cursor` pagination.

