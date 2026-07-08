# Social Supply Management — Frontend

React + TypeScript single-page app that consumes the [backend API](../backend) to manage institutions, products, donations and distributions for the social supply program.

> This is the frontend half of the [Social Supply Management monorepo](../README.md).

## Tech stack

- [Vite](https://vitejs.dev/) + React 18 + TypeScript
- [React Router](https://reactrouter.com/) for client-side routing
- [TanStack Query](https://tanstack.com/query) for server-state (fetching, caching, invalidation)
- [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) for forms and validation
- [Axios](https://axios-http.com/) for HTTP, with a JWT interceptor
- [Tailwind CSS](https://tailwindcss.com/) for styling

## Getting started

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The app runs at `http://localhost:5173`. In dev mode, Vite proxies any `/api/*` request to `http://localhost:8080` (see `vite.config.ts`), so the backend must be running separately (`docker compose up -d db api` from the repo root, or `mvn spring-boot:run` inside `backend/`).

## Scripts

| Command           | Description                          |
|--------------------|---------------------------------------|
| `npm run dev`      | Start the Vite dev server             |
| `npm run build`    | Type-check and build for production   |
| `npm run lint`     | Run ESLint                            |
| `npm run preview`  | Preview the production build locally  |

## Structure

```
src/
├── components/
│   ├── layout/      # AppLayout, Sidebar, Header
│   └── ui/          # Button, Input, Select, Modal, Table helpers, etc.
├── context/         # AuthContext (JWT session, current user, role)
├── hooks/           # TanStack Query hooks per resource (institutions, products, ...)
├── lib/             # Axios instance + interceptors, QueryClient
├── pages/           # One folder per resource, each with a list page + form modal
├── types/           # TypeScript types mirroring the backend DTOs
└── utils/           # Formatting helpers (dates, CNPJ mask, quantities)
```

## Authentication

The app stores the JWT returned by `/api/v1/auth/login` (or `/register`, which also logs in) in `localStorage`. Every request attaches `Authorization: Bearer <token>` via an Axios request interceptor. A 401 response clears the session and redirects to `/login`. Users with the `ADMIN` role additionally see delete actions on institutions and products, matching the backend's `@PreAuthorize("hasRole('ADMIN')")` restriction.
