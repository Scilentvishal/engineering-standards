# Backend Performance Optimization

## 1. Asynchronous & Non-Blocking I/O
- Always use asynchronous, non-blocking APIs for filesystem, network, and database I/O.
- Offload CPU-intensive operations (image processing, crypto generation, report generation) to worker threads or background message queues (BullMQ, Celery, SQS).

## 2. Caching Strategy
- Cache read-heavy, slow-changing data in fast in-memory stores like Redis with explicit TTLs.
- Implement cache-aside or write-through patterns.
- Ensure cache invalidation occurs immediately upon writes/updates.

