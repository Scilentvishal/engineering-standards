# Frontend API Client & Data Integration

## 1. Client Architecture
- **Centralized API Client**: Route all network requests through a centralized HTTP client instance (e.g., configured Axios or `fetch` wrapper).
- **Interceptors & Authentication**: Attach authorization tokens and tenant headers uniformly in request interceptors.
- **Request Cancellation**: Support and attach `AbortSignal` to cancel in-flight queries when components unmount or user searches are debounced.

## 2. Server State vs Client State
- Use dedicated server-state caching libraries (TanStack Query, SWR, or RTK Query) rather than storing server data in global client stores (Redux/Zustand).
- Define standardized response envelopes: `{ data, meta, error }`.
- Handle loading, error, empty, and success states explicitly in the UI with skeletons or accessible status regions.

