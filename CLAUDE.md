# CLAUDE.md

Guidance for Claude Code (or any AI coding agent) working in this repository.

## What this is

A monorepo for a social supply management system: institutions receive **donations** of products, which enter the **inventory**, and are then **distributed** back to institutions serving families in vulnerable situations.

```
social-supply-management-api/
├── backend/    Spring Boot 3 REST API (Java 21, PostgreSQL, JWT auth)
├── frontend/   React + TypeScript SPA (Vite, Tailwind, TanStack Query)
├── docker-compose.yml   Orchestrates db + api + web
└── .github/workflows/ci.yml   Two jobs: backend (Maven), frontend (npm)
```

Each package has its own `README.md` with full details — [backend/README.md](backend/README.md), [frontend/README.md](frontend/README.md). This file focuses on cross-cutting context and conventions an agent needs before making changes.

## Running things

```bash
cd frontend && npm ci && npm run lint && npm run build   # or: npm run dev
cd backend && mvn -B clean test                            # or: mvn spring-boot:run
```

`frontend/package-lock.json` is committed — CI uses `npm ci` with the lockfile cached. If you add/bump a dependency, run `npm install` locally and commit the updated lockfile.

Full stack via Docker (from repo root): `docker compose up --build` — frontend at `:3000`, API at `:8080`, Swagger at `:8080/swagger-ui.html`. Note both `docker-compose.yml` here and any other clone of this repo use the same hardcoded `container_name`s (`doacoes-db`, `doacoes-api`) — running two checkouts' stacks at once will collide; stop one or rename containers first.

## The contract between frontend and backend

The frontend has **no backend code of its own** — it's a pure client of the API. When you change a backend DTO, controller route, enum, or validation rule, the matching frontend type/hook/form almost certainly needs updating too, and vice versa. Check both sides.

| Backend source of truth | Frontend mirror |
|---|---|
| `backend/src/main/java/.../dto/request/*.java` | `frontend/src/types/*.ts` (`*Request` interfaces) |
| `backend/src/main/java/.../dto/response/*.java` | `frontend/src/types/*.ts` (entity interfaces) |
| `backend/src/main/java/.../entity/enums/*.java` | `frontend/src/types/*.ts` (union types + `*_LABELS` maps) |
| `backend/src/main/java/.../controller/*.java` | `frontend/src/hooks/use*.ts` (route paths, query params) |
| Bean Validation annotations on request DTOs | Zod schemas in `frontend/src/pages/**/*FormModal.tsx` |
| `GlobalExceptionHandler` → `ErrorResponse` shape | `frontend/src/types/common.ts` (`ApiErrorResponse`) + `lib/api.ts` (`extractErrorMessage`) |

Domain enums as of this writing — check the Java source before relying on this, it will drift:
- `UserRole`: `ADMIN`, `OPERATOR`
- `ProductCategory`: `ALIMENTO`, `HIGIENE`, `LIMPEZA`, `VESTUARIO`, `OUTROS`
- `ProductUnit`: `KG`, `LITRO`, `UNIDADE`, `CAIXA`, `PACOTE`

API base path: `/api/v1`. All routes require a JWT (`Authorization: Bearer <token>`) except `/api/v1/auth/**` and Swagger. `DELETE /institutions/{id}`, `DELETE /products/{id}`, and everything under `/users` additionally require the `ADMIN` role (`@PreAuthorize("hasRole('ADMIN')")`) — the frontend hides those buttons/routes for `OPERATOR` users via `useAuth().isAdmin` and `<AdminRoute>`, but that's a UX nicety, not the security boundary; the backend enforces it.

**`RegisterRequestDTO` has no `role` field on purpose.** A client-supplied role on public self-registration would let anyone become ADMIN — this was a real hole in an earlier version of this app, closed in `AuthServiceImpl.register()`: the first user ever created becomes ADMIN (bootstrap), everyone after that is forced to `OPERATOR` regardless of what's sent. Promoting/demoting a user afterwards requires an existing ADMIN, via `PATCH /api/v1/users/{id}/role` (`UserController` → `UserServiceImpl.updateRole`), which also refuses to let an ADMIN change their own role (`BusinessException`, avoids accidental lockout). If you ever touch registration or role assignment again, preserve this: **never trust a role coming from an unauthenticated request.**

Donations and distributions are **append-only** in the backend (only `POST`, `GET /{id}`, `GET` list exist — no update/delete endpoints), so their frontend pages intentionally have no edit/delete UI. Don't add one without adding the backend endpoint first.

**Product stock (`currentStock`) is a derived, server-owned value — never accept it from a request.** `ProductRequestDTO` only carries `minimumStock` (the alert threshold); `currentStock` always starts at `BigDecimal.ZERO` and is only ever mutated by `DonationServiceImpl.register()` (+= quantity) and `DistributionServiceImpl.register()` (-= quantity, after checking `currentStock >= quantity` and throwing `BusinessException` — 422 — if not). If you add another way to move stock (returns, adjustments, corrections), route it through the same pattern: validate against `currentStock` before mutating, mutate inside the same transaction as the record that caused it. `GET /products/low-stock` (`ProductRepository.findLowStock()`) returns products where `minimumStock IS NOT NULL AND currentStock <= minimumStock` — the frontend dashboard and Products page both read `lowStock` off `ProductResponseDTO` rather than recomputing the comparison client-side.

## Backend conventions (`backend/`)

- Layered architecture: `controller` → `service` (+ `service/impl`) → `repository`, with `mapper` for entity↔DTO conversion. Controllers never touch repositories directly; entities never leave the service layer (always mapped to a DTO).
- Request DTOs are Java `record`s with Bean Validation annotations (`@NotBlank`, `@Size`, etc.) — validation messages are what `GlobalExceptionHandler` surfaces to the client field-by-field.
- Custom exceptions (`ResourceNotFoundException`, `DuplicateResourceException`, `BusinessException`, `InvalidCredentialsException`) map to specific HTTP statuses in `GlobalExceptionHandler` — throw the right one rather than a generic exception.
- JWT is HS256, secret and expiration come from `jwt.secret` / `jwt.expiration-ms` (env `JWT_SECRET` / `JWT_EXPIRATION_MS`), see `security/JwtService.java`.
- Schema is `ddl-auto: update` (no Flyway/Liquibase) — when adding a `nullable = false` column to an entity that may already have rows (any non-trivial deployment), give it a `columnDefinition` with a `default` (see `Product.currentStock`) so Postgres can backfill existing rows instead of failing the `ALTER TABLE`.
- Tests live in `backend/src/test`, using JUnit 5 + Mockito + AssertJ, one test class per service impl.
- Commit convention: Conventional Commits (`feat`, `fix`, `refactor`, `docs`, `style`, `test`, `chore`) — see backend README for the full table.

## Frontend conventions (`frontend/`)

- Vite + React 18 + TypeScript, path alias `@/*` → `frontend/src/*` (both `tsconfig.json` and `vite.config.ts`). `tsconfig.node.json` covers `vite.config.ts` itself (editor-only, not part of the `npm run build` type-check, deliberately not wired via TS project references — kept simple since composite/references add failure modes that are hard to verify without running `tsc`).
- Server state (all API data) goes through **TanStack Query** hooks in `src/hooks/` — one file per resource, exporting query hooks (`useInstitutions`, `useAllProducts`, ...) and mutation hooks (`useCreateProduct`, ...). Don't call `api` directly from a page component; add/extend a hook instead.
- Forms use **React Hook Form + Zod**, with a Zod schema colocated in the `*FormModal.tsx` file, deliberately mirroring the backend's Bean Validation constraints (same max lengths, same required fields). If the backend validation changes, update the schema.
- `src/lib/api.ts` holds the single Axios instance: request interceptor attaches the JWT from `localStorage`, response interceptor clears the session and redirects to `/login` on 401. `extractErrorMessage(error)` turns a backend `ErrorResponse` into a user-facing string — use it in every mutation's `catch`.
- Auth/session state lives in `src/context/AuthContext.tsx` (`useAuth()` gives `user`, `isAuthenticated`, `isAdmin`, `login`, `register`, `logout`). `register` logs the user in immediately (matches backend behavior: `/auth/register` returns a token). The register form has no role field — see the security note above.
- `<ProtectedRoute>` (must be logged in) and `<AdminRoute>` (must be `isAdmin`, else redirects to `/`) are route-wrapper components in `src/components/`, composed in `App.tsx`. `/users` is wrapped in both. Follow this pattern for any future admin-only page.
- Reusable primitives live in `src/components/ui/` (`Button`, `Input`, `Select`, `Textarea`, `Modal`, `Pagination`, `Badge`, `Spinner`, `EmptyState`, `ErrorBanner`) — prefer these over ad-hoc markup when building new pages.
- Page structure per resource: `src/pages/<resource>/<Resource>ListPage.tsx` (table + pagination) and `<Resource>FormModal.tsx` (create/edit form in a modal). Follow this pattern for any new resource.
- Styling is Tailwind utility classes only — no CSS modules/styled-components. The `brand` color scale is defined in `tailwind.config.js`.
- Text inputs that map to a Bean Validation-constrained field get, where it makes sense: an example `placeholder`, an `onKeyDown` guard from `src/utils/inputGuards.ts` (`blockDigits` for name-like fields, `blockLetters` for numeric/document fields — these `preventDefault()` the keystroke, they don't just clean up after), and for CNPJ/phone/CPF specifically, live formatting via `register(name, { onChange })` mutating `e.target.value` using a formatter from `src/utils/mask.ts` (`formatCnpj`, `formatPhone`, `formatCpfCnpj`). Follow this pattern for any new "documento"/phone/name field rather than inventing a new one.
- In dev, Vite proxies `/api/*` to `http://localhost:8080` (`vite.config.ts`); in the Docker image, nginx does the same (`frontend/nginx.conf`) — so the frontend always calls a relative `/api/v1` and never hardcodes a host.

## Things to watch for

- Money/quantity fields are `BigDecimal` on the backend (`quantity` on donations/distributions, `currentStock`/`minimumStock` on products) — the frontend treats them as plain `number`, which is fine for the quantities in this domain but don't extend that assumption to actual currency without reconsidering precision.
- Dates are ISO `yyyy-MM-dd` strings end-to-end (`LocalDate` on the backend); `formatDate`/`todayIsoDate` in `frontend/src/utils/format.ts` handle display/defaults — don't introduce a different date library or format.
- `familiesServed` on institutions and other optional numeric fields are sent as `undefined` (omitted) rather than `null` when empty, matching what Jackson's `non_null` inclusion setting expects.
- CORS is wide open (`allowedOriginPatterns("*")` in `backend/.../config/WebConfig.java`) — fine for this project's current scope, but don't copy that pattern into something with real authz stakes without revisiting it.
