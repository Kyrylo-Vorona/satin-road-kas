# Satin Road

Satin Road is a small marketplace project for the Programming II interdisciplinary assignment.
The repository contains the .NET API and a Bun + React frontend. The database is hosted on Neon.

## MVP scope

The implemented basic flow is:

- log in as a normal user or administrator;
- browse and create product listings;
- browse categories;
- manage personal inventory;
- buy products from other users;
- allow administrators to manage categories.

A normal user can both buy and sell. Administrator is the only separate role.
Authentication is an additional project feature rather than an assignment requirement. Test users
can be created through Swagger/API; the frontend provides login but not a registration screen.

## Technology

- .NET 10 Web API
- Linq2db with PostgreSQL hosted on Neon
- OpenAPI and Swagger UI
- xUnit
- Bun and React

## Repository structure

```text
SatinRoad.Api/        API, entities, DTOs, and business rules
SatinRoad.Api.Tests/  xUnit tests
SatinRoad.Web/        Bun + React frontend
compose.yaml          Local Docker setup for the API and frontend
```

The project intentionally keeps a small structure. New layers and abstractions should only be
introduced when they remove real duplication or make important logic testable.

## Running the API

Requirements:

- .NET 10 SDK
- access to the team's Neon database

The API reads the Neon connection string from `ConnectionStrings:DefaultConnection`. Provide it
with the `ConnectionStrings__DefaultConnection` environment variable and never commit it to Git.

```text
ConnectionStrings__DefaultConnection="<Neon connection string>"
```

Run the API from the repository root:

```shell
dotnet restore
dotnet run --project SatinRoad.Api
```

With the HTTP launch profile, Swagger UI is available at `http://localhost:5118`.

For local frontend development, run `bun install` and `bun run dev` in `SatinRoad.Web/`.
Vite serves the frontend at `http://localhost:5173` and forwards `/api` to the local API.

To run the frontend and API with Docker, set `SATINROAD_DB_CONNECTION` to the team's Neon
connection string, then run `docker compose up --build`. Open `http://localhost:8080`.
Compose does not start a database container; Neon remains external. The port is bound to
localhost, and this HTTP setup is for local testing only, not public deployment.

Successful login creates a server-verified session cookie. The frontend sends it automatically
on same-origin API requests, and logging out clears it. A Docker restart may require another
login because session keys are not persisted.

The database schema is not yet included in the repository. Database-backed endpoints therefore
require the team's existing Neon database until a reproducible schema setup is added.

## Tests and quality assurance

The project uses a **Test Last** approach: tests are added around existing, agreed behaviour before
that behaviour is extended or changed. Tests should focus on business rules and important API
flows rather than framework code, DTO property accessors, or coverage percentage alone.

Run all tests with:

```shell
dotnet test
```

Current automated tests cover the order-count threshold, the 20% repeat-customer discount,
controller ownership checks, and basic authorization rules. The final user and administrator flows
were therefore also tested manually through the Docker frontend.
Database integration tests will be added after a separate test database and reproducible schema
setup are available. Automated tests must not modify the team's shared Neon data.

## Lighthouse and sustainability

Lighthouse 13.5.0 was run on 4 October 2026 against the Docker production build at
`http://localhost:8080`. The audit used Lighthouse's default mobile configuration and the public
login page.

| Category | Score |
| --- | ---: |
| Performance | 81 |
| Accessibility | 100 |
| Best practices | 96 |
| SEO | 100 |

The measured First Contentful Paint was 2.1 seconds, Largest Contentful Paint was 2.3 seconds,
Total Blocking Time was 0 ms, and Cumulative Layout Shift was 0.296. The initial page transferred
243 KiB in four requests. It loaded no images, web fonts, media, or third-party resources.

The frontend uses a production Vite build served by nginx. Its small dependency set, lack of
third-party page resources, and absence of continuous client-side work keep network and CPU use
limited. Docker makes the same production build reproducible for local testing, while Neon remains
an external shared service. A standard `robots.txt` was added after the first audit, improving the
SEO score from 91 to 100.

The remaining performance cost is mainly the initial session check and its layout change. An
anonymous session also produces an expected `401` response from `/api/Users/me`, which Lighthouse
reports as a console error and lowers the Best Practices score. These were documented instead of
adding extra session or layout code solely to improve the audit score.

## Git workflow

All work should follow the assignment workflow:

1. Create a workable-sized GitHub issue.
2. Create a branch from the latest `main`.
3. Keep the branch focused on that issue.
4. Open a pull request linked to the issue.
5. Ask another team member for a code review before merging.

## Team responsibilities

- Kyrylo: backend, database, and API/Swagger
- Azade: React frontend and API integration
- Samuele: xUnit tests, GitHub Projects/Issues, Lighthouse, and README

## Future improvements

- add a reproducible database schema and a separate test database;
- configure HTTPS and durable session keys before any public deployment;
- add database integration tests for the core user flows;

Optional hard stories should be completed only after the full MVP flow works from frontend to
API and database.
