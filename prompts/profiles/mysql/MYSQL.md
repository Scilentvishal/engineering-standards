# MySQL Engineering Profile

## 1. Engine & Schema Standards
- Always use the `InnoDB` storage engine for ACID compliance, row-level locking, and foreign key support.
- Set character set to `utf8mb4` with collation `utf8mb4_unicode_ci` or `utf8mb4_0900_ai_ci` to support full Unicode including emojis.
- Define explicit primary keys on every table (prefer auto-incrementing integer or sequential UUIDs) to ensure efficient clustered index organization.

## 2. Query & Pagination Performance
- **Database-Level Operations Only**: Execute all `WHERE`, `ORDER BY`, and pagination clauses directly in MySQL queries.
- Optimize offset pagination on large tables using deferred joins (joining against an indexed primary key subquery) or cursor-based pagination.
- Use `EXPLAIN` to verify that queries leverage indexes and do not trigger slow `Using filesort` or `Using temporary` operations.

