# TypeScript Engineering Profile

## 1. Strict Typing & Zero `any` Policy
- **Never use `any`**: The use of `any` disables type checking and defeats the purpose of TypeScript.
- **Use `unknown` for Untrusted Boundaries**: When handling external inputs (API payloads, query params, parsed JSON, third-party events), type them as `unknown` and validate with runtime schemas (Zod) or explicit type guards.
- **Avoid Non-Null Assertions (`!`)**: Avoid using `!` to bypass compiler checks. Handle `null` and `undefined` with optional chaining (`?.`), nullish coalescing (`??`), or early guard clauses.
- **Avoid Unsafe Type Casting (`as unknown as Type`)**: Prefer type narrowing via discriminating unions or `instanceof` / `typeof` checks.

---

## 2. Types vs. Interfaces
- **Use `interface` for Object Shapes & Public APIs**:
  - Prefer `interface` for defining domain entities, service contracts, and class implementations because of better compiler performance and extensibility (`extends`).
- **Use `type` for Unions, Primitives & Utility Combinations**:
  - Use `type` for union types (`type Status = 'ACTIVE' | 'INACTIVE'`), tuples, intersection types, and mapped types.

---

## 3. Enums vs. `as const` Object Unions
- Prefer `as const` objects over numeric or string TypeScript `enum`:
  ```typescript
  // Recommended pattern:
  export const VehicleStatus = {
    ACTIVE: 'ACTIVE',
    MAINTENANCE: 'MAINTENANCE',
    RETIRED: 'RETIRED',
  } as const;

  export type VehicleStatus = (typeof VehicleStatus)[keyof typeof VehicleStatus];
  ```
  *Why*: `as const` compiles to clean standard JavaScript objects with zero runtime bloat, works seamlessly with JSON serialization, and avoids reverse-mapping quirks.

---

## 4. Single Source of Truth: Schema-Driven Typing with Zod
- Avoid maintaining duplicate manual interfaces alongside runtime validation schemas. Derive TypeScript types directly from your schemas:
  ```typescript
  import { z } from 'zod';

  export const CreateVehicleSchema = z.object({
    vin: z.string().min(17).max(17),
    make: z.string().min(1),
    model: z.string().min(1),
    year: z.number().int().min(1900),
    status: z.enum(['ACTIVE', 'MAINTENANCE', 'RETIRED']),
  });

  // Automatically inferred type:
  export type CreateVehicleDTO = z.infer<typeof CreateVehicleSchema>;
  ```

---

## 5. Reusability, Generics & Utility Types
- **Constrained Generics**: Always constrain generic type parameters:
  ```typescript
  // Constrained:
  function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
    return obj[key];
  }
  ```
- **Leverage Built-In Utility Types**:
  - `Pick<T, K>` and `Omit<T, K>` for subset projections (e.g. `Omit<Vehicle, 'id' | 'createdAt'>`).
  - `Partial<T>` and `Required<T>` for mutation updates.
  - `Readonly<T>` and `readonly T[]` to enforce immutability on function arguments.
  - `ReturnType<T>` and `Awaited<T>` to extract return values from async services.

---

## 6. Compiler Configuration (`tsconfig.json`)
Every production TypeScript project must enable strict checking:
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```
