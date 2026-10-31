# Database Transactions and Indexing

## 1. Indexing Principles
- **B-Tree Indexes**: Standard for equality (`=`) and range queries (`<`, `>`, `BETWEEN`).
- **Composite Indexes**: Follow the Leftmost Prefix Rule. Order columns: `(equality_columns, range_columns, sort_columns)`.
- **Index Selectivity**: Index columns with high cardinality (many distinct values, e.g. `email`, `uuid`). Avoid indexing low-cardinality boolean columns unless using partial indexes.
- **Index Overhead**: Every index slows down `INSERT`, `UPDATE`, and `DELETE` operations. Monitor index usage and drop unused indexes.

## 2. Transactions & Concurrency Control
- Wrap all multi-step state mutations that must succeed or fail together in atomic database transactions (`BEGIN` ... `COMMIT` / `ROLLBACK`).
- Keep transaction duration as short as possible: perform validation, parsing, and non-database operations before beginning the transaction.
- **Concurrency Control**:
  - **Optimistic Locking**: Use a `version` or `updated_at` column to detect concurrent edits without holding long locks.
  - **Pessimistic Locking**: Use `SELECT ... FOR UPDATE` only when strict exclusive access is necessary to avoid race conditions (e.g. inventory decrement, wallet balance transfer).

