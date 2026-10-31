# PostgreSQL Engineering Profile

## 1. Schema Design & Query Performance
- **Database-Level Operations Only**: Execute all filtering (`WHERE`), sorting (`ORDER BY`), and pagination (`LIMIT`/`OFFSET` or keyset cursors) directly inside PostgreSQL.
- **Never fetch entire tables** into application runtime memory to filter with application code.
- Take advantage of PostgreSQL advanced data types: JSONB with GIN indexes for dynamic attributes, UUIDs for distributed identifiers, and `timestamptz` for all timestamps.
- Analyze query execution plans using `EXPLAIN (ANALYZE, BUFFERS)` to diagnose sequential scans and optimize index usage.

## 2. Concurrency & Reliability
- Use connection pooling (PgBouncer or robust application pools) to manage connection limits.
- Use row-level locking (`SELECT ... FOR UPDATE`) inside transactions when managing concurrent balance deductions or inventory allocations.
- Implement keyset pagination for large tables using composite indexed comparisons: `WHERE (created_at, id) < ($1, $2) ORDER BY created_at DESC, id DESC LIMIT $3`.

