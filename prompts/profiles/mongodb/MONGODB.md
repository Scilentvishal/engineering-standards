# MongoDB & Mongoose Engineering Profile

## 1. Document Modeling & Query Rules
- **Database-Level Operations Only**: Always execute filtering (`$match`), sorting (`$sort`), projection (`$project`), and pagination (`$skip`/`$limit` or range queries) inside the MongoDB query/aggregation pipeline.
- **Never fetch entire collections** into Node.js memory to filter or paginate with JavaScript array methods.
- Define compound indexes matching query patterns using `.index({ field1: 1, field2: -1 })`.
- Use `.lean()` for read-only queries in Mongoose to bypass document hydration overhead and reduce memory consumption.

## 2. Aggregations & Schema Hygiene
- Use Aggregation Pipelines (`aggregate([...])`) for analytical grouping, lookup joins (`$lookup`), and faceted search.
- When performing `$lookup`, always filter and sort prior to the lookup stage whenever possible to reduce Cartesian overhead.
- Enable `strict: true` and `timestamps: true` on all Mongoose schemas.

