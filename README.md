# Satin Road

Satin Road is a small marketplace project for the Programming II interdisciplinary assignment.
The current repository contains the .NET API. The React frontend, reproducible database schema,
and application deployment setup still need to be added.

## MVP scope

The team is focusing on the basic flow before optional features:

- register and log in;
- browse and create product listings;
- browse categories;
- manage personal inventory;
- buy products from other users;
- allow administrators to manage categories.

A normal user can both buy and sell. Administrator is the only separate role.

## Technology

- .NET 10 Web API
- Linq2db with PostgreSQL hosted on Neon
- OpenAPI and Swagger UI
- xUnit
- Bun and React for the planned frontend

## Repository structure

```text
SatinRoad.Api/        API, entities, DTOs, and business rules
SatinRoad.Api.Tests/  xUnit tests
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

Current automated tests cover the order-count threshold and the 20% repeat-customer discount.
Database integration tests will be added after a separate test database and reproducible schema
setup are available. Automated tests must not modify the team's shared Neon data.

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

## Work still required

- add a reproducible schema setup for Neon;
- decide how the API and frontend will be deployed or containerized;
- implement real authentication and administrator authorization;
- finish and integrate the Bun + React frontend;
- add database integration tests for the core user flows;
- create and use GitHub Projects, Issues, pull requests, and reviews;
- run Lighthouse when the frontend is available and document the results here.

Optional hard stories should be completed only after the full MVP flow works from frontend to
API and database.
