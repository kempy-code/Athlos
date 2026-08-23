# Athlos deployment

## Requirements

- Node.js 22 or newer (the application uses the built-in SQLite module).
- HTTPS in production.
- A persistent writable volume mounted at `DATA_DIR`.
- `OPENAI_API_KEY` configured only in the hosting provider's secret manager.

## Environment

Copy `.env.example` locally, but never commit `.env`. In production set:

- `NODE_ENV=production`
- `PORT` to the port expected by the host
- `DATA_DIR` to a persistent volume
- `OPENAI_API_KEY` as a secret
- `OPENAI_MODEL` to an available model supporting the Responses API

## Start

```sh
npm ci
npm run test:release
npm start
```

## Production checklist

- Put the app behind an HTTPS reverse proxy.
- Back up the `DATA_DIR` volume.
- Configure uptime monitoring and server log collection.
- Set spending and rate limits for the OpenAI project.
- Add a transactional email provider before launch for verified email and forgotten-password recovery.
- Move the isolated database functions in `db.js` to managed Postgres before running multiple server instances.
- Publish terms, privacy, medical disclaimer, and data-deletion policies reviewed for the launch regions.

## Pre-release diagnostics

- `npm test` runs fast unit tests without starting a server.
- `npm run test:integration` starts an isolated temporary server and verifies API compatibility, registration, sessions, per-user persistence, logout, and security headers.
- `npm run test:release` runs the complete pre-release suite.
- `npm run doctor` checks the server currently running at `http://127.0.0.1:3000`. Set `ATHLOS_URL` to check another deployment.

## Current storage model

Accounts, sessions, plans, workout history, readiness data, and coach messages are stored per user in SQLite. This is suitable for a single persistent production instance and can later be migrated to Postgres without changing browser components.
