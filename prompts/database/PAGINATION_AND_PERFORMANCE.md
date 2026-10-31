# Database Performance, Filtering, Sorting & Pagination

> [!CRITICAL]
> **DEFAULT DATABASE-LEVEL OPERATION MANDATE**:
> By default, all filtering, searching, sorting, and pagination must be executed **at the database level**.
> **Never fetch an entire table or collection into application runtime memory (Node.js/Python) to filter, sort, or paginate in application memory.**
> In-memory collection filtering causes catastrophic memory bloat, high latency, event-loop starvation, and database I/O saturation.
> 
> *Pragmatic Override Rule*: If the developer explicitly instructs you to filter a small fixed set of in-memory data (e.g. 5 static configuration enum items), honor their explicit request.

---

## 1. Efficient Filtering & Sorting
- Every `WHERE` clause filter and `ORDER BY` clause must be passed directly to the database engine.
- Create composite indexes matching the query pattern: `(filter_column_1, filter_column_2, sort_column)`.
- Use `EXPLAIN ANALYZE` (or dialect equivalent) to verify index scans and avoid sequential table scans on tables with more than a few thousand rows.

---

## 2. Pagination Strategies

### A. Offset-Based Pagination
- Syntax: `LIMIT :limit OFFSET :offset`
- **When to use**: Administrative dashboards with small total record counts (< 10,000 records) where jumping to random page numbers is required.
- **Drawback**: As `offset` grows, database performance degrades linearly ($O(N)$) because the engine must scan and discard all preceding offset rows.

### B. Keyset / Cursor-Based Pagination (Preferred for Scale)
- Syntax: `WHERE (created_at, id) < (:cursor_created_at, :cursor_id) ORDER BY created_at DESC, id DESC LIMIT :limit`
- **When to use**: Infinite scrolling feeds, high-throughput APIs, large datasets (> 10,000 records).
- **Advantages**: Constant $O(1)$ lookup time regardless of depth when supported by an index on `(created_at, id)`. Prevents skipped or duplicate items during real-time insertions.

---

## 3. Avoiding the N+1 Query Problem
- Never issue individual secondary queries in a loop over parent entities.
- In relational databases, use SQL joins or batch fetching (`WHERE parent_id IN (...)`).
- In ORMs (Prisma, TypeORM, Drizzle), always use eager loading / batch inclusion (`include: { relations: true }`).
- Limit selected columns using projection (`SELECT id, name` instead of `SELECT *`).
