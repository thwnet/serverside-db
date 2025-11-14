# serverside-db

Landing page that persists short "thoughts" to a local MariaDB instance via a lightweight Express API.

## Prerequisites

- Node.js 18+ and npm
- MariaDB 10.5+ running locally

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the example environment file and adjust it to match your local MariaDB credentials:
   ```bash
   cp env.example .env
   ```
3. Create the database schema:
   ```bash
   mariadb -u <user> -p < db/schema.sql
   ```
4. Start the API (auto-restarts in dev mode):
   ```bash
   npm run dev
   ```
5. Open `index.html` in a static server (e.g., VS Code Live Server or `npx serve`) and ensure the `<body data-api-base>` value in the HTML points to your API origin (defaults to `http://localhost:4000`).

## API overview

| Method | Route        | Description                         |
| ------ | ------------ | ----------------------------------- |
| GET    | `/health`    | Pings the database connection       |
| GET    | `/thoughts`  | Returns the most recent saved items |
| POST   | `/thoughts`  | Persists a new thought (`{ text }`) |

`POST /thoughts` trims the payload, limits it to 280 characters, and returns the stored row including the generated timestamp.

## Environment variables

All configurable values live in `.env` (see `env.example` for defaults):

| Variable             | Purpose                                      |
| -------------------- | -------------------------------------------- |
| `PORT`               | Express server port                          |
| `CLIENT_ORIGIN`      | Comma-separated list of allowed CORS origins |
| `DB_HOST`/`DB_SERVER`| MariaDB host (both names are supported)      |
| `DB_PORT`            | MariaDB port                                 |
| `DB_USER`            | MariaDB user                                 |
| `DB_PASSWORD`/`DB_PWD` | MariaDB password (both names supported)  |
| `DB_NAME`            | Database name (`thoughts_db` by default)     |
| `DB_CONNECTION_LIMIT` | Size of the MariaDB connection pool        |
| `RESULT_LIMIT`       | Max number of thoughts returned via GET      |

## Development tips

- Update `data-api-base` in `index.html` if the API runs on a different host/port.
- Use the provided `db/schema.sql` as a starting point for migrations.
- Run `npm start` for a production-style server without auto-reload.