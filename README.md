<div align="center">

# Social Supply Management API

### Backend application for managing institutions, donations, inventory and food distribution in social supply programs

[![Java](https://img.shields.io/badge/Java-21-orange?logo=openjdk)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3-brightgreen?logo=springboot)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker)](https://www.docker.com/)
[![CI](https://img.shields.io/badge/CI-GitHub%20Actions-2088FF?logo=githubactions)](https://github.com/features/actions)
[![License](https://img.shields.io/badge/license-MIT-lightgrey)](#-license)

</div>

<p align="center">
  <img src="docs/demo.gif" alt="API demo via Swagger UI" width="850">
  <br>
  <sub><i>📌 Record a GIF walking through Swagger (e.g. <a href="https://www.screentogif.com/">ScreenToGif</a>) and save it to <code>docs/demo.gif</code> to replace this placeholder.</i></sub>
</p>

---

## 📖 About the project

**Social Supply Management API** supports the full lifecycle of a social food assistance program:

> Registered institutions ➜ receive **donations** of products ➜ that enter the **inventory** ➜ and are **distributed** back to institutions supporting families in vulnerable situations.

Inspired by real operational processes observed in social supply chain management, this project simulates the backend of a system that any municipality or NGO network could use to coordinate food donations and distribution — with clean architecture, automated tests, containerization, and CI from day one.

This is the **V1** repository: the core registrations and movements work end-to-end, with a clear layered architecture and automated tests — ready to evolve with authentication, real-time inventory control, and dashboards.

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
        centrally by GlobalExceptionHandler (`exception` package)
```

### Package layout

```
src/main/java/br/gov/prefeitura/doacoes
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
├── config         # Configuration (Swagger, CORS, etc.)
├── exception      # Custom exceptions + GlobalExceptionHandler
└── security       # (reserved for JWT authentication — V2)
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

### Option 1 — With Docker (recommended)

```bash
git clone https://github.com/duanjesus/social-supply-management-api.git
cd social-supply-management-api
docker compose up --build
```

The API comes up at `http://localhost:8080` and PostgreSQL at `localhost:5432`.

### Option 2 — Locally with Maven

```bash
# start only the database
docker compose up -d db

# run the application
mvn spring-boot:run
```

### Interactive documentation (Swagger)

With the application running, visit:

```
http://localhost:8080/swagger-ui.html
```

### Running the tests

```bash
mvn test
```

---

## 📡 Endpoints (V1)

### Institutions — `/api/v1/institutions`

| Method | Route                        | Description                  |
|--------|------------------------------|-------------------------------|
| POST   | `/api/v1/institutions`       | Register an institution       |
| PUT    | `/api/v1/institutions/{id}`  | Update an institution          |
| DELETE | `/api/v1/institutions/{id}`  | Delete an institution          |
| GET    | `/api/v1/institutions/{id}`  | Find institution by ID         |
| GET    | `/api/v1/institutions`       | List institutions (paginated)  |

### Products — `/api/v1/products`

| Method | Route                    | Description               |
|--------|--------------------------|-----------------------------|
| POST   | `/api/v1/products`        | Register a product          |
| PUT    | `/api/v1/products/{id}`   | Update a product             |
| DELETE | `/api/v1/products/{id}`   | Delete a product             |
| GET    | `/api/v1/products/{id}`   | Find product by ID           |
| GET    | `/api/v1/products`        | List products (paginated)    |

### Donations — `/api/v1/donations`

| Method | Route                      | Description            |
|--------|-----------------------------|--------------------------|
| POST   | `/api/v1/donations`         | Register a donation      |
| GET    | `/api/v1/donations/{id}`    | Find donation by ID      |
| GET    | `/api/v1/donations`         | List donations (paginated) |

### Distributions — `/api/v1/distributions`

| Method | Route                           | Description                  |
|--------|-----------------------------------|---------------------------------|
| POST   | `/api/v1/distributions`         | Register a distribution         |
| GET    | `/api/v1/distributions/{id}`    | Find distribution by ID          |
| GET    | `/api/v1/distributions`         | List distributions (paginated)   |

---

## 🗺️ Roadmap

- [x] **V1** — Core registrations (institutions, products), donations and distributions
- [ ] **V2** — Authentication and authorization with JWT (login, ADMIN/OPERATOR roles)
- [ ] **V2** — Real-time inventory control (stock balance per product, low-quantity alerts)
- [ ] **V3** — Dashboard with metrics (families served, most-donated products, most active institutions)
- [ ] **V3** — Exportable reports (PDF/Excel) by period and institution
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

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
