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

No Node.js/npm is installed in some environments used to develop this repo — frontend changes here were written by hand and have **not** been verified with `npm install` / `tsc` / `vite build`. Before trusting a frontend change, actually run:

```bash
cd frontend
npm install
npm run lint
npm run build
```

Backend:

```bash
cd backend
mvn -B clean test
```

No `frontend/package-lock.json` is committed yet (it couldn't be generated in the environment this scaffold was written in, since Node wasn't installed there). The first `npm install` will create it — commit that lockfile, then switch `npm install` → `npm ci` and re-enable `cache: 'npm'` in `.github/workflows/ci.yml` for faster, reproducible builds.

Full stack via Docker (from repo root): `docker compose up --build` — frontend at `:3000`, API at `:8080`, Swagger at `:8080/swagger-ui.html`.

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

API base path: `/api/v1`. All routes require a JWT (`Authorization: Bearer <token>`) except `/api/v1/auth/**` and Swagger. `DELETE /institutions/{id}` and `DELETE /products/{id}` additionally require the `ADMIN` role (`@PreAuthorize("hasRole('ADMIN')")`) — the frontend hides those buttons for `OPERATOR` users via `useAuth().isAdmin`, but that's a UX nicety, not the security boundary; the backend enforces it.

Donations and distributions are **append-only** in the backend (only `POST`, `GET /{id}`, `GET` list exist — no update/delete endpoints), so their frontend pages intentionally have no edit/delete UI. Don't add one without adding the backend endpoint first.

## Backend conventions (`backend/`)

- Layered architecture: `controller` → `service` (+ `service/impl`) → `repository`, with `mapper` for entity↔DTO conversion. Controllers never touch repositories directly; entities never leave the service layer (always mapped to a DTO).
- Request DTOs are Java `record`s with Bean Validation annotations (`@NotBlank`, `@Size`, etc.) — validation messages are what `GlobalExceptionHandler` surfaces to the client field-by-field.
- Custom exceptions (`ResourceNotFoundException`, `DuplicateResourceException`, `BusinessException`, `InvalidCredentialsException`) map to specific HTTP statuses in `GlobalExceptionHandler` — throw the right one rather than a generic exception.
- JWT is HS256, secret and expiration come from `jwt.secret` / `jwt.expiration-ms` (env `JWT_SECRET` / `JWT_EXPIRATION_MS`), see `security/JwtService.java`.
- Tests live in `backend/src/test`, using JUnit 5 + Mockito + AssertJ, one test class per service impl.
- Commit convention: Conventional Commits (`feat`, `fix`, `refactor`, `docs`, `style`, `test`, `chore`) — see backend README for the full table.

## Frontend conventions (`frontend/`)

- Vite + React 18 + TypeScript, path alias `@/*` → `frontend/src/*` (both `tsconfig.app.json` and `vite.config.ts`).
- Server state (all API data) goes through **TanStack Query** hooks in `src/hooks/` — one file per resource, exporting query hooks (`useInstitutions`, `useAllProducts`, ...) and mutation hooks (`useCreateProduct`, ...). Don't call `api` directly from a page component; add/extend a hook instead.
- Forms use **React Hook Form + Zod**, with a Zod schema colocated in the `*FormModal.tsx` file, deliberately mirroring the backend's Bean Validation constraints (same max lengths, same required fields). If the backend validation changes, update the schema.
- `src/lib/api.ts` holds the single Axios instance: request interceptor attaches the JWT from `localStorage`, response interceptor clears the session and redirects to `/login` on 401. `extractErrorMessage(error)` turns a backend `ErrorResponse` into a user-facing string — use it in every mutation's `catch`.
- Auth/session state lives in `src/context/AuthContext.tsx` (`useAuth()` gives `user`, `isAuthenticated`, `isAdmin`, `login`, `register`, `logout`). `register` logs the user in immediately (matches backend behavior: `/auth/register` returns a token).
- Reusable primitives live in `src/components/ui/` (`Button`, `Input`, `Select`, `Textarea`, `Modal`, `Pagination`, `Badge`, `Spinner`, `EmptyState`, `ErrorBanner`) — prefer these over ad-hoc markup when building new pages.
- Page structure per resource: `src/pages/<resource>/<Resource>ListPage.tsx` (table + pagination) and `<Resource>FormModal.tsx` (create/edit form in a modal). Follow this pattern for any new resource.
- Styling is Tailwind utility classes only — no CSS modules/styled-components. The `brand` color scale is defined in `tailwind.config.js`.
- In dev, Vite proxies `/api/*` to `http://localhost:8080` (`vite.config.ts`); in the Docker image, nginx does the same (`frontend/nginx.conf`) — so the frontend always calls a relative `/api/v1` and never hardcodes a host.

## Things to watch for

- Money/quantity fields are `BigDecimal` on the backend (`quantity` on donations/distributions) — the frontend treats them as plain `number`, which is fine for the quantities in this domain but don't extend that assumption to actual currency without reconsidering precision.
- Dates are ISO `yyyy-MM-dd` strings end-to-end (`LocalDate` on the backend); `formatDate`/`todayIsoDate` in `frontend/src/utils/format.ts` handle display/defaults — don't introduce a different date library or format.
- `familiesServed` on institutions and other optional numeric fields are sent as `undefined` (omitted) rather than `null` when empty, matching what Jackson's `non_null` inclusion setting expects.
- CORS is wide open (`allowedOriginPatterns("*")` in `backend/.../config/WebConfig.java`) — fine for this project's current scope, but don't copy that pattern into something with real authz stakes without revisiting it.
