# Entry

A personal journal app with a modern frontend and a Go backend.

## What Is Inside

- `fox`: frontend (Vite + TypeScript + React)
- `ant`: backend (Go + SQLite)
- `Makefile`: one-command local workflows

## Quick Start (Local Development)

### 1) Prerequisites

- Go
- Node.js (with Corepack enabled)
- pnpm

### 2) Install frontend dependencies

```bash
cd fox
corepack enable
pnpm install
cd ..
```

### 3) Set required backend environment variable

`ENTRY_AUTH_SECRET` is required.

```bash
export ENTRY_AUTH_SECRET="replace-with-a-long-random-secret"
```

You can generate a random secret with:

```bash
openssl rand -base64 32
```

### 4) Run both backend + frontend

```bash
make dev
```

App URLs while developing:

- Frontend dev server: http://localhost:5173
- Backend: http://localhost:3000

## Build Commands

```bash
make build
```

This builds frontend assets and compiles the backend binary.

## Test Commands

```bash
make test
```

## Docker

### Build image

Run from the repository root (important for Docker build context):

```bash
docker build -f ant/Dockerfile -t entry-ant:latest .
```

### Run container

```bash
docker run --name entry-ant \
  -e ENTRY_AUTH_SECRET="replace-with-a-long-random-secret" \
  -e ENTRY_PORT=3000 \
  -p 3000:3000 \
  entry-ant:latest
```

### Run with persisted data

```bash
docker run --name entry-ant \
  -e ENTRY_AUTH_SECRET="replace-with-a-long-random-secret" \
  -e ENTRY_PORT=3000 \
  -e ENTRY_DATA_DIR=/var/lib/entry/data \
  -e ENTRY_DB_PATH=/var/lib/entry/sqlite/entry.db \
  -p 3000:3000 \
  -v "$(pwd)/ant/data:/var/lib/entry/data" \
  -v "$(pwd)/ant/sqlite:/var/lib/entry/sqlite" \
  entry-ant:latest
```

Notes:

- `EXPOSE 3000` in Dockerfile is metadata only.
- You must publish ports with `-p host:container`.
- If `ENTRY_PORT` changes, update the right side of `-p` accordingly.

## Docker Compose

```bash
docker compose -f ant/docker-compose.yml up --build
```

The compose file already uses the correct build context for `ant/` and `fox/` copies.

## Environment Variables

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `ENTRY_AUTH_SECRET` | Yes | - | Secret used for auth/session signing |
| `ENTRY_PORT` | No | `3000` | Backend listen port |
| `ENTRY_DATA_DIR` | No | `./data` | Directory for app data |
| `ENTRY_DB_PATH` | No | `<ENTRY_DATA_DIR>/entry.db` | SQLite database path |
| `ENTRY_DEV_PROXY` | No | empty | Frontend dev proxy URL |
| `ENTRY_READ_TIMEOUT` | No | `10s` | HTTP read timeout |
| `ENTRY_READ_HEADER_TIMEOUT` | No | `5s` | HTTP read-header timeout |
| `ENTRY_WRITE_TIMEOUT` | No | `15s` | HTTP write timeout |
| `ENTRY_IDLE_TIMEOUT` | No | `60s` | HTTP idle timeout |
| `ENTRY_REQUEST_TIMEOUT` | No | `15s` | Request-level timeout |
| `ENTRY_LIST_DEFAULT_LIMIT` | No | `30` | Default list page size |
| `ENTRY_LIST_MAX_LIMIT` | No | `100` | Max list page size |
| `ENTRY_SESSION_DURATION` | No | `168h` | Session lifetime |

## Project Layout

```text
entry/
├─ ant/        # Go backend
├─ fox/        # Frontend app
├─ docs/       # Notes and docs
└─ Makefile    # Dev/build/test helpers
```
