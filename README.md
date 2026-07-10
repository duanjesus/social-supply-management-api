<div align="center">

# Social Supply Management

### Full-stack application for managing institutions, donations, inventory and food distribution in social supply programs

[![Java](https://img.shields.io/badge/Java-21-orange?logo=openjdk)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3-brightgreen?logo=springboot)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker)](https://www.docker.com/)
[![License](https://img.shields.io/badge/license-MIT-lightgrey)](#-license)

</div>

---

## 📖 About the project

**Social Supply Management** supports the full lifecycle of a social food assistance program:

> Registered institutions ➜ receive **donations** of products ➜ that enter the **inventory** ➜ and are **distributed** back to institutions supporting families in vulnerable situations.

This repository is a **monorepo** containing both halves of the system:

| Package | Description | Docs |
|---|---|---|
| [`backend/`](backend) | Spring Boot 3 REST API — JWT auth, PostgreSQL persistence, layered architecture | [backend/README.md](backend/README.md) |
| [`frontend/`](frontend) | React + TypeScript SPA that consumes the API | [frontend/README.md](frontend/README.md) |

---

## 🚀 Quick start (full stack, with Docker)

```bash
git clone https://github.com/duanjesus/social-supply-management-api.git
cd social-supply-management-api
docker compose up --build
```

| Service  | URL                                      |
|----------|-------------------------------------------|
| Frontend | http://localhost:3000                     |
| API      | http://localhost:8080                     |
| Swagger  | http://localhost:8080/swagger-ui.html      |
| Postgres | localhost:5432                             |

The `web` container (nginx) serves the built React app and proxies `/api/*` calls to the `api` container, so the frontend works out of the box with no extra configuration.

To use the app: open the frontend, click **Cadastre-se** to create the first user (choose role `ADMIN` to unlock delete actions), then log in.

## 🧪 Local development (without Docker)

Run each half separately for hot-reload during development:

```bash
# 1. Database only
docker compose up -d db

# 2. Backend (terminal 1)
cd backend
mvn spring-boot:run

# 3. Frontend (terminal 2)
cd frontend
npm install
npm run dev
```

Frontend dev server: http://localhost:5173 (Vite proxies `/api` to `http://localhost:8080`).

---

## 🏗️ Repository layout

```
social-supply-management-api/
├── backend/            # Spring Boot API (Java 21, PostgreSQL, JWT auth)
│   ├── src/
│   ├── pom.xml
│   ├── Dockerfile
│   └── README.md
├── frontend/           # React + TypeScript SPA (Vite, Tailwind, TanStack Query)
│   ├── src/
│   ├── package.json
│   ├── Dockerfile
│   └── README.md
├── docker-compose.yml  # Orchestrates db + api + web together
├── .github/workflows/  # CI: backend build/test, frontend lint/build
└── CLAUDE.md           # Guide for AI coding agents working in this repo
```

Each package is independently runnable and documented — see their READMEs for tech stack details, available scripts, and architecture notes.

---

## 🗺️ Roadmap

- [x] **V1** — Core registrations (institutions, products), donations and distributions
- [x] **V2** — Authentication and authorization with JWT (login, ADMIN/OPERATOR roles)
- [x] **V2** — React frontend consuming the API, monorepo structure
- [x] **V3** — Real-time inventory control (stock balance per product, low-quantity alerts)
- [x] **V3** — Dashboard with metrics (families served, donations this month, low-stock alerts)
- [ ] **V3** — Exportable reports (PDF/Excel) by period and institution
- [ ] **V3** — Automated deployment (Railway/Render/AWS) via GitHub Actions

---

## 🌱 Commit convention

This project follows **Conventional Commits** (`feat`, `fix`, `refactor`, `docs`, `style`, `test`, `chore`) — see [backend/README.md](backend/README.md#-commit-convention) for the full guide.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
