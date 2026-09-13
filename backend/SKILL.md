---
name: personal-book-library-backend
description: Build or modify Personal Book Library backend APIs. Use when adding Express routes, validation, controllers, services, PostgreSQL models, migrations, or backend tests in backend/.
---

# Personal Book Library Backend Rules

Apply these rules to every change inside `backend/`. Keep each API feature in
small layers with one clear responsibility, and compose those layers in
`app.js`.

## Stack and entry points

- The backend is Node.js with Express 5, CommonJS modules, `pg`, and
  PostgreSQL. Do not introduce TypeScript or a new framework for one feature.
- `server.js` loads environment variables, imports the shared `pool`, creates
  the app, and starts the HTTP server. Keep application wiring out of it.
- `app.js` creates dependencies and mounts routers. It must retain
  `express.json()` before API routes and `errorHandler` after them.
- `src/config/connectdb.js` owns the PostgreSQL pool. Models receive `pool`
  through their factory; do not import the database connection inside a model.

## Directory ownership

```text
app.js                  compose feature dependencies and mount /api routers
server.js               load configuration and start the server
src/config/             shared infrastructure such as the PostgreSQL pool
src/models/             parameterized SQL queries and returned database rows
src/services/           business rules and coordination between models
src/controllers/        HTTP request/response handling and status codes
src/middlewares/        authentication, validation, and cross-cutting HTTP work
src/routes/             endpoint-to-middleware/controller mappings
migrations/             PostgreSQL schema used by Docker Compose
test/                   Node built-in test-runner API tests
```

## Feature structure and dependency flow

Build a CRUD feature in this order, adding only layers that the feature needs:

```text
pool → <domain>Model → <domain>Service → <domain>Controller → <domain>Router
                                               ↑
                              validation/authentication middleware
```

1. Define the endpoint contract: URL, HTTP method, request body, successful
   response, and expected `400`, `401`, and `404` cases.
2. Add `src/models/<domain>Model.js`. Export a factory such as
   `createCategoryModel({ pool })`; its functions contain SQL only.
3. Add `src/services/<domain>Service.js`. Export a factory that receives the
   model. Put domain rules, duplicate checks, or coordination of multiple
   models here—not in a controller.
4. Add `src/controllers/<domain>Controller.js`. Export a factory that receives
   the service. It translates service results into HTTP responses and calls
   `next(error)` for unexpected failures.
5. Add validation middleware when input is accepted. Store normalized values on
   `req` (for example, `req.categoryInput`) so controllers do not repeat
   parsing or validation.
6. Add `src/routes/<domain>.js`. Create an Express router and arrange
   authentication, validation, and controller functions in execution order.
7. In `app.js`, import every factory, create the chain from `pool` to router,
   and mount it under `/api/...` before `errorHandler`.

Do not have a controller import a model directly when the feature has a
service. Do not have services access `req` or `res`, and do not write SQL in a
controller or service.

## Models and PostgreSQL

- Use `pool.query(sql, values)` with `$1`, `$2`, and so on. Never concatenate
  input into SQL strings.
- Select or return explicit columns; mutation queries that need to return a
  record must use `RETURNING`.
- Return `rows` for collection queries and `rows[0]` for one-record queries.
  An undefined single record means the controller can produce a `404`.
- Keep database naming in snake_case (`category_id`, `category_name`) and use
  JavaScript camelCase for local function arguments when it improves clarity.
- PostgreSQL `BIGINT` identifiers may exceed JavaScript's safe integer range.
  Validate route IDs, then keep them as strings when passing them to `pg`.

## HTTP, validation, and authentication

- Routes that read or mutate library data should use the supplied
  `requireAuthentication` middleware unless the endpoint is deliberately
  public. Authentication uses the `access_token` cookie, not a request body
  token.
- Validate body types, required values, whitespace-only strings, and column
  length limits before calling a service. Validate route IDs before querying.
- Use clear, stable response shapes. For example, return `{ category }` for a
  single category and `{ categories }` for a collection.
- Use `201` for a newly created resource. For a successful deletion, use
  `204` when no response body is needed, or `200` with an acknowledgement such
  as `{ success: true }` when the API contract requires one. Use `400` for
  invalid input, `401` for missing/invalid authentication, and `404` when an
  existing resource is not found.
- Let unexpected database and application errors reach `errorHandler`; do not
  disclose database details to the client.

## Database schema

- Read `migrations/mirations.sql` before designing a model. It is the current
  source of truth for table names, columns, constraints, and foreign keys.
- Docker Compose executes this exact, intentionally misspelled filename. Do
  not rename it without updating Compose.
- The migration file is rerun by the current Compose workflow. Schema changes
  must be safe to apply repeatedly, or the migration workflow must be revised
  deliberately as part of the task.

## Tests and quality gate

- Place API tests in `backend/test/` and use Node's built-in `node:test`.
  Follow `test/login.test.js`: create the app with a mock `pool`, start a local
  server, and verify observable HTTP behavior.
- Cover successful requests, invalid input, unauthenticated access, not-found
  results, and unexpected database errors when relevant to the endpoint.
- Run these commands from `backend/` after backend changes:

  ```bash
  node --check app.js
  npm test
  ```

- Keep changes focused. Do not alter unrelated APIs, environment settings, or
  user work while adding a backend feature.
