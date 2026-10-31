# Prisma ORM Engineering Profile

## 1. Schema Modeling & Relations
- Define explicit relations with `@relation` attributes and configure referential actions (`onDelete: Cascade` or `onDelete: Restrict`).
- Declare indexes explicitly in `schema.prisma` using `@@index([field1, field2])` and unique constraints with `@@unique([tenantId, email])`.
- Avoid unnecessary nullable fields; keep schema strongly typed and model migrations using `prisma migrate dev`.

## 2. Query Efficiency & Pagination Rules
- **Strict Database Operations**: Always use Prisma's `where`, `orderBy`, `take`, and `skip` (or `cursor`) arguments. Never load thousands of records with `findMany()` only to filter with JS array `.filter()`.
- **Selective Field Loading**: Use `select` to retrieve only required fields, especially on models with heavy text or JSON columns.
- **Avoid N+1 Queries**: Never call Prisma queries inside loops. Use `include` or batch queries (`where: { id: { in: ids } }`).
- **Cursor Pagination**: Implement cursor pagination using `cursor: { id: lastId }`, `skip: 1`, `take: limit`.
- **Transactions**: Use interactive transactions `prisma.$transaction(async (tx) => { ... })` for multi-step mutations.

