# Database Engineering Standards

## 1. Core Principles
- **Schema Normalization vs Practical Denormalization**: Design relational schemas to 3rd Normal Form (3NF) to preserve consistency. Denormalize intentionally only after profiling performance bottlenecks.
- **Data Integrity via Constraints**: Always enforce integrity at the database level using `FOREIGN KEY`, `NOT NULL`, `CHECK`, and `UNIQUE` constraints rather than relying purely on application-level validations.
- **Connection Pooling**: Always configure database connection pools with appropriate pool sizing (`min`, `max`, idle timeouts) matching workload capacity.

## 2. Query Safety & Migration Standards
- **Always Parameterize Queries**: Never concatenate raw strings into SQL queries. Always use prepared statements or trusted query builders to eliminate SQL injection vulnerabilities.
- **Versioned Migrations**: Every database schema change must be captured in forward and backward (rollback) migration files executed sequentially through CI/CD pipelines.

