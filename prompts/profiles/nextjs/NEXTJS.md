# Next.js Engineering Profile

## 1. App Router & React Server Components (RSC)
- Default to **Server Components** (`app/` directory). Keep data fetching on the server to reduce client bundle size and eliminate client-side request waterfalls.
- Use the `'use client'` directive only when client interactivity is strictly required (browser APIs, `useState`, `useEffect`, event listeners).
- Push `'use client'` boundaries down to leaf components to maximize server-rendered HTML.

## 2. Server-Side Data Fetching & Caching
- Fetch data directly in Server Components using async/await.
- Leverage Next.js cache semantics explicitly (`cache: 'force-cache'`, `next: { revalidate: 60 }`, or `no-store` / `unstable_noStore`).
- Implement Route Handlers (`route.ts`) for webhook ingresses and external API consumers.
- Use **Server Actions** for form submissions and mutations, pairing them with `revalidatePath` or `revalidateTag`.
- Never expose server-only secrets or environment variables in client components. Ensure server-only packages are protected using `import 'server-only'`.

