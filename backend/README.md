<div align="center">

# Social Supply Management API — Backend

### Spring Boot backend for managing institutions, donations, inventory and food distribution in social supply programs

[![Java](https://img.shields.io/badge/Java-21-orange?logo=openjdk)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3-brightgreen?logo=springboot)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql)](https://www.postgresql.org/)

</div>

> This is the backend half of the [Social Supply Management monorepo](../README.md). See the root README for the full-stack quick start (API + React frontend together).

---

## 🏗️ Architecture

The project follows a layered architecture with clear separation of concerns:

```
                                ┌───────────────────┐
                                │     Controller      │  → Handles HTTP requests, validates input (DTO)
                                └─────────┬───────────┘
                                          │
                                ┌─────────▼───────────┐
                                │       Service         │  → Business rules, transaction orchestration
                                └─────────┬───────────┘
                                          │
                         ┌────────────────┼────────────────┐
                         │                                 │
               ┌─────────▼──────────┐          ┌───────────▼───────────┐
               │      Mapper          │          │      Repository        │  → Data access (Spring Data JPA)
               │ (Entity ↔ DTO)        │          └───────────┬───────────┘
               └───────────────────────┘                      │
                                                      ┌────────▼────────┐
                                                      │   PostgreSQL      │
                                                      └───────────────────┘

        Business exceptions (ResourceNotFound, DuplicateResource) are handled
        centrally by GlobalExceptionHandler (`exception` package). JWT
        authentication is enforced by a servlet filter (`security` package).
```

### Package layout

```
backend/src/main/java/br/gov/prefeitura/doacoes
├── controller     # REST endpoints (API entry point)
├── service        # Business rule interfaces
│   └── impl       # Concrete service implementations
├── repository     # Spring Data JPA interfaces
├── entity         # JPA entities (database mapping)
│   └── enums      # Domain enumerations
├── dto
│   ├── request    # Input objects, with Bean Validation
│   └── response   # Output objects
├── mapper         # Entity ↔ DTO conversion
├── config         # Configuration (Swagger, CORS, Security)
├── exception      # Custom exceptions + GlobalExceptionHandler
└── security       # JWT authentication filter, JwtService, UserDetailsService
```

**Why this structure?** Every layer has a single responsibility. Controllers never talk directly to the database; services never know HTTP details; entities never leak outside the API (always via DTO). This makes the codebase easier to test in isolation, maintain, and hand off to new team members.

---

## 🧰 Tech stack

| Category            | Technology                            |
|---------------------|------------------------------------------|
| Language             | Java 21                                   |
| Framework            | Spring Boot 3.3                           |
| Web                  | Spring Web (REST)                         |
| Persistence          | Spring Data JPA + Hibernate                |
| Database             | PostgreSQL 16                             |
| Validation           | Bean Validation (Jakarta Validation)      |
| Auth                 | Spring Security + JWT (jjwt)               |
| Boilerplate          | Lombok                                     |
| Documentation        | Springdoc OpenAPI / Swagger UI            |
| Testing              | JUnit 5 + Mockito + AssertJ                |
| Containerization     | Docker + Docker Compose                    |
| Continuous integration | GitHub Actions                          |

---

## 🚀 Getting started

### Prerequisites
- Java 21+ (to run locally without Docker)
- Docker and Docker Compose (recommended)

### Option 1 — With Docker (recommended, whole stack)

From the **repository root**:

```bash
docker compose up --build
```

This starts PostgreSQL, the backend API, and the React frontend together. The API comes up at `http://localhost:8080`.

### Option 2 — Backend only, locally with Maven

```bash
# start only the database (from repo root)
docker compose up -d db

# run the application (from backend/)
cd backend
mvn spring-boot:run
```

### Interactive documentation (Swagger)

With the application running, visit:

```
http://localhost:8080/swagger-ui.html
```

### Running the tests

```bash
cd backend
mvn test
```

---

## 📡 Endpoints (V2)

### Authentication — `/api/v1/auth`

Every endpoint below (except `/api/v1/auth/**` and Swagger itself) requires a valid JWT sent in the `Authorization: Bearer {token}` header. `DELETE` endpoints additionally require the `ADMIN` role.

| Method | Route                    | Description                          |
|--------|--------------------------|-----------------------------------------|
| POST   | `/api/v1/auth/register`  | Self-register a new user                |
| POST   | `/api/v1/auth/login`     | Authenticate and receive a JWT token    |

**`/auth/register` never accepts a client-supplied role** — that would let anyone register themselves as ADMIN. Instead: the **first user ever created becomes ADMIN automatically** (bootstrap), and every registration after that is forced to `OPERATOR`, no matter what the request body contains. To promote someone to ADMIN later, an existing ADMIN must call `PATCH /api/v1/users/{id}/role` (see the Users section below).

**Register:**

```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Ana Souza", "email": "ana@example.org", "password": "supersecret123"}'
```

**Login:**

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "ana@example.org", "password": "supersecret123"}'
```

Both return a JSON body containing the `token` field. Use it in subsequent requests:

```bash
curl http://localhost:8080/api/v1/institutions \
  -H "Authorization: Bearer {token}"
```

In Swagger UI, click the **Authorize** button (top right) and paste the token to have it applied automatically to every "Try it out" call.

### Users — `/api/v1/users`

Restricted to `ADMIN`. This is how you promote an OPERATOR (or demote an ADMIN) after the initial bootstrap. An ADMIN cannot change their own role (guards against accidental lockout).

| Method | Route                       | Description                        |
|--------|------------------------------|-------------------------------------|
| GET    | `/api/v1/users`              | List users (paginated, ADMIN only)  |
| PATCH  | `/api/v1/users/{id}/role`    | Change a user's role (ADMIN only)   |

```bash
curl -X PATCH http://localhost:8080/api/v1/users/2/role \
  -H "Authorization: Bearer {admin-token}" \
  -H "Content-Type: application/json" \
  -d '{"role": "ADMIN"}'
```

### Institutions — `/api/v1/institutions`

| Method | Route                        | Description                  |
|--------|------------------------------|-------------------------------|
| POST   | `/api/v1/institutions`       | Register an institution       |
| PUT    | `/api/v1/institutions/{id}`  | Update an institution          |
| DELETE | `/api/v1/institutions/{id}`  | Delete an institution (ADMIN)  |
| GET    | `/api/v1/institutions/{id}`  | Find institution by ID         |
| GET    | `/api/v1/institutions`       | List institutions (paginated)  |

### Products — `/api/v1/products`

Each product carries a **stock balance** (`currentStock`) that the API maintains automatically — it is never set directly by the client. It increments when a donation of that product is registered, and decrements when a distribution is registered. An optional `minimumStock` threshold can be set per product; when `currentStock` drops to or below it, the product shows up in `/products/low-stock` and `lowStock: true` in its response.

| Method | Route                      | Description                                    |
|--------|-----------------------------|--------------------------------------------------|
| POST   | `/api/v1/products`          | Register a product (optional `minimumStock`)     |
| PUT    | `/api/v1/products/{id}`     | Edit a product (name/category/unit/minimumStock) |
| DELETE | `/api/v1/products/{id}`     | Delete a product (ADMIN)                         |
| GET    | `/api/v1/products/{id}`     | Find product by ID                               |
| GET    | `/api/v1/products`          | List products (paginated)                        |
| GET    | `/api/v1/products/low-stock`| List products at or below their minimum stock    |

### Donations — `/api/v1/donations`

Registering a donation adds its `quantity` to the donated product's `currentStock`. `GET /donations` accepts optional `startDate`/`endDate` (`yyyy-MM-dd`) query params to filter by `donationDate`, used by the frontend's Reports page.

| Method | Route                      | Description            |
|--------|-----------------------------|--------------------------|
| POST   | `/api/v1/donations`         | Register a donation      |
| GET    | `/api/v1/donations/{id}`    | Find donation by ID      |
| GET    | `/api/v1/donations`         | List donations (paginated, optional `startDate`/`endDate`) |

### Distributions — `/api/v1/distributions`

Registering a distribution subtracts its `quantity` from the distributed product's `currentStock`. If the product doesn't have enough stock, the request fails with `422 Unprocessable Entity` and no distribution is created. `GET /distributions` accepts the same optional `startDate`/`endDate` as donations, plus an optional `institutionId`.

| Method | Route                           | Description                  |
|--------|-----------------------------------|---------------------------------|
| POST   | `/api/v1/distributions`         | Register a distribution (fails if stock is insufficient) |
| GET    | `/api/v1/distributions/{id}`    | Find distribution by ID          |
| GET    | `/api/v1/distributions`         | List distributions (paginated, optional `startDate`/`endDate`/`institutionId`) |

---

## 🗺️ Roadmap

- [x] **V1** — Core registrations (institutions, products), donations and distributions
- [x] **V2** — Authentication and authorization with JWT (login, ADMIN/OPERATOR roles)
- [x] **V2** — React frontend consuming the API (see [../frontend](../frontend))
- [x] **V3** — Real-time inventory control (stock balance per product, low-quantity alerts)
- [x] **V3** — Dashboard with metrics (families served, donations this month, low-stock alerts, top donated products, most-attended institutions, 6-month trend)
- [x] **V3** — Exportable reports (PDF/CSV) by period and institution
- [ ] **V3** — Automated deployment (Railway/Render/AWS) via GitHub Actions

---

## 🌱 Commit convention

This project follows **Conventional Commits**:

```
feat: create institution entity
fix: correct cnpj validation regex
refactor: extract institution mapper
docs: update readme with endpoints table
style: apply consistent indentation on service layer
test: add unit tests for donation service
chore: configure github actions workflow
```

| Type       | When to use                                              |
|------------|-----------------------------------------------------------|
| `feat`     | New feature                                                |
| `fix`      | Bug fix                                                    |
| `refactor` | Code change without behavior change                        |
| `docs`     | Documentation changes                                       |
| `style`    | Formatting, indentation, no logic change                    |
| `test`     | Adding or adjusting tests                                    |
| `chore`    | Maintenance tasks (build, dependencies, CI, etc.)           |
