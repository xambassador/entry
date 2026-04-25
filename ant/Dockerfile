FROM node:24-alpine AS frontend-builder

WORKDIR /src/fox

COPY fox/package.json fox/pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

COPY fox/ ./
RUN pnpm build


FROM golang:1.26.1-alpine AS backend-builder

WORKDIR /src/ant

COPY ant/go.mod ant/go.sum ./
RUN go mod download

COPY ant/ ./
COPY --from=frontend-builder /src/fox/dist ./frontend/dist

RUN CGO_ENABLED=0 GOOS=linux go build -o /out/server ./cmd/server


FROM alpine:3.22

RUN apk add --no-cache ca-certificates

WORKDIR /app

COPY --from=backend-builder /out/server /app/server
COPY ant/docker-entrypoint.sh /app/entrypoint.sh

RUN chmod +x /app/entrypoint.sh && mkdir -p /var/lib/entry/data /var/lib/entry/sqlite

ENV ENTRY_PORT=3000 \
    ENTRY_DATA_DIR=/var/lib/entry/data \
    ENTRY_DB_PATH=/var/lib/entry/sqlite/entry.db

EXPOSE 3000

ENTRYPOINT ["/app/entrypoint.sh"]
