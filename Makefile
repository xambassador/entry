.PHONY: dev dev-client dev-server build build-client build-server test test-client test-server

dev:
	@make -j2 dev-server dev-client

dev-client:
	cd fox && pnpm dev

dev-server:
	cd ant && go run ./cmd/server

build: build-client build-server

build-client:
	cd fox && pnpm build

build-server:
	cd ant && go build -o bin/server ./cmd/server

test: test-server

test-server:
	cd ant && go test ./...
