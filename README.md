<div align="center">

# 🍲 Doações API

### Sistema de gestão de instituições, produtos, doações e distribuições de alimentos para prefeituras

[![Java](https://img.shields.io/badge/Java-21-orange?logo=openjdk)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3-brightgreen?logo=springboot)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker)](https://www.docker.com/)
[![CI](https://img.shields.io/badge/CI-GitHub%20Actions-2088FF?logo=githubactions)](https://github.com/features/actions)
[![License](https://img.shields.io/badge/license-MIT-lightgrey)](#-licença)

</div>

<p align="center">
  <img src="docs/demo.gif" alt="Demonstração da API via Swagger" width="850">
  <br>
  <sub><i>📌 Grave um GIF navegando pelo Swagger (ex: <a href="https://www.screentogif.com/">ScreenToGif</a>) e salve em <code>docs/demo.gif</code> para substituir este placeholder.</i></sub>
</p>

---

## 📖 Sobre o projeto

A **Doações API** foi criada para apoiar prefeituras na gestão do ciclo completo de assistência social alimentar:

> Instituições cadastradas ➜ recebem **doações** de produtos ➜ que entram no **estoque** ➜ e são **distribuídos** de volta para as instituições que atendem famílias em situação de vulnerabilidade.

Este é o repositório da **V1**, com o núcleo de cadastros e movimentações funcionando de ponta a ponta, arquitetura em camadas bem definida e testes automatizados — pronto para evoluir com autenticação, controle de estoque em tempo real e dashboards.

---

## 🏗️ Arquitetura

O projeto segue uma arquitetura em camadas (*layered architecture*), com separação clara de responsabilidades:

```
                                ┌───────────────────┐
                                │     Controller     │  → Recebe requisições HTTP, valida entrada (DTO)
                                └─────────┬───────────┘
                                          │
                                ┌─────────▼───────────┐
                                │       Service        │  → Regras de negócio, orquestra transações
                                └─────────┬───────────┘
                                          │
                         ┌────────────────┼────────────────┐
                         │                                 │
               ┌─────────▼──────────┐          ┌───────────▼───────────┐
               │      Mapper         │          │      Repository        │  → Acesso a dados (Spring Data JPA)
               │ (Entity ↔ DTO)      │          └───────────┬───────────┘
               └─────────────────────┘                      │
                                                    ┌────────▼────────┐
                                                    │   PostgreSQL     │
                                                    └─────────────────┘

        Exceções de negócio (ResourceNotFound, DuplicateResource) são capturadas
        de forma centralizada pelo GlobalExceptionHandler (pacote `exception`)
```

### Organização dos pacotes

```
src/main/java/br/gov/prefeitura/doacoes
├── controller     # Endpoints REST (camada de entrada da API)
├── service        # Interfaces de regra de negócio
│   └── impl       # Implementações concretas dos services
├── repository     # Interfaces Spring Data JPA
├── entity         # Entidades JPA (mapeamento com o banco)
│   └── enums      # Enumerações de domínio
├── dto
│   ├── request    # Objetos de entrada, com Bean Validation
│   └── response   # Objetos de saída
├── mapper         # Conversão Entity ↔ DTO
├── config         # Configurações (Swagger, CORS, etc.)
├── exception      # Exceções customizadas + GlobalExceptionHandler
└── security       # (reservado para autenticação JWT — V2)
```

**Por que assim?** Cada camada tem uma única responsabilidade. Controllers nunca falam diretamente com o banco; services nunca conhecem detalhes de HTTP; entidades nunca vazam diretamente para fora da API (sempre via DTO). Isso facilita testes isolados, manutenção e onboarding de novos devs no time.

---

## 🧰 Tecnologias

| Categoria         | Tecnologia                          |
|-------------------|--------------------------------------|
| Linguagem         | Java 21                              |
| Framework         | Spring Boot 3.3                      |
| Web               | Spring Web (REST)                    |
| Persistência      | Spring Data JPA + Hibernate           |
| Banco de dados    | PostgreSQL 16                        |
| Validação         | Bean Validation (Jakarta Validation) |
| Boilerplate       | Lombok                               |
| Documentação      | Springdoc OpenAPI / Swagger UI       |
| Testes            | JUnit 5 + Mockito + AssertJ          |
| Containerização   | Docker + Docker Compose              |
| Integração contínua | GitHub Actions                     |

---

## 🚀 Como executar

### Pré-requisitos
- Java 21+ (para rodar localmente sem Docker)
- Docker e Docker Compose (recomendado)

### Opção 1 — Com Docker (recomendado)

```bash
git clone https://github.com/sua-prefeitura/doacoes-api.git
cd doacoes-api
docker compose up --build
```

A API sobe em `http://localhost:8080` e o banco PostgreSQL em `localhost:5432`.

### Opção 2 — Localmente com Maven

```bash
# suba apenas o banco de dados
docker compose up -d db

# rode a aplicação
mvn spring-boot:run
```

### Documentação interativa (Swagger)

Com a aplicação rodando, acesse:

```
http://localhost:8080/swagger-ui.html
```

### Rodando os testes

```bash
mvn test
```

---

## 📡 Endpoints (V1)

### Instituições — `/api/v1/institutions`

| Método | Rota                        | Descrição                  |
|--------|------------------------------|-----------------------------|
| POST   | `/api/v1/institutions`       | Cadastrar instituição       |
| PUT    | `/api/v1/institutions/{id}`  | Editar instituição          |
| DELETE | `/api/v1/institutions/{id}`  | Excluir instituição         |
| GET    | `/api/v1/institutions/{id}`  | Buscar instituição por ID   |
| GET    | `/api/v1/institutions`       | Listar instituições (paginado) |

### Produtos — `/api/v1/products`

| Método | Rota                     | Descrição               |
|--------|---------------------------|---------------------------|
| POST   | `/api/v1/products`         | Cadastrar produto         |
| PUT    | `/api/v1/products/{id}`    | Editar produto            |
| DELETE | `/api/v1/products/{id}`    | Excluir produto           |
| GET    | `/api/v1/products/{id}`    | Buscar produto por ID     |
| GET    | `/api/v1/products`         | Listar produtos (paginado) |

### Doações — `/api/v1/donations`

| Método | Rota                       | Descrição            |
|--------|-----------------------------|------------------------|
| POST   | `/api/v1/donations`         | Registrar doação       |
| GET    | `/api/v1/donations/{id}`    | Buscar doação por ID   |
| GET    | `/api/v1/donations`         | Listar doações (paginado) |

### Distribuições — `/api/v1/distributions`

| Método | Rota                           | Descrição                 |
|--------|----------------------------------|-----------------------------|
| POST   | `/api/v1/distributions`         | Registrar distribuição       |
| GET    | `/api/v1/distributions/{id}`    | Buscar distribuição por ID   |
| GET    | `/api/v1/distributions`         | Listar distribuições (paginado) |

---

## 🗺️ Roadmap

- [x] **V1** — Cadastros base (instituições, produtos), doações e distribuições
- [ ] **V2** — Autenticação e autorização com JWT (login, perfis ADMIN/OPERADOR)
- [ ] **V2** — Controle de estoque em tempo real (saldo por produto, alertas de baixa quantidade)
- [ ] **V3** — Dashboard com indicadores (famílias atendidas, produtos mais doados, instituições mais ativas)
- [ ] **V3** — Relatórios exportáveis (PDF/Excel) por período e instituição
- [ ] **V3** — Deploy automatizado (Railway/Render/AWS) via GitHub Actions

---

## 🌱 Padrão de commits

Este projeto segue **Conventional Commits**:

```
feat: create institution entity
fix: correct cnpj validation regex
refactor: extract institution mapper
docs: update readme with endpoints table
style: apply consistent indentation on service layer
test: add unit tests for donation service
chore: configure github actions workflow
```

| Tipo       | Quando usar                                             |
|------------|----------------------------------------------------------|
| `feat`     | Nova funcionalidade                                       |
| `fix`      | Correção de bug                                           |
| `refactor` | Alteração de código sem mudar comportamento               |
| `docs`     | Alterações em documentação                                 |
| `style`    | Formatação, indentação, sem mudança de lógica              |
| `test`     | Criação ou ajuste de testes                                |
| `chore`    | Tarefas de manutenção (build, dependências, CI, etc.)      |

---

## 📄 Licença

Distribuído sob a licença MIT. Veja `LICENSE` para mais informações.
