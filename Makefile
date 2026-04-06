.PHONY: dev dev-client dev-server build build-client build-server test test-client test-server

dev:
	@make -j2 dev-server dev-client

dev-client:
	cd fox && pnpm dev

dev-server:
	cd ant && ENTRY_DEV_PROXY=http://localhost:5173 go run ./cmd/server

build: build-client build-server

build-client:
	cd fox && pnpm build

build-server: build-client
	rm -rf ant/frontend/dist
	cp -r fox/dist ant/frontend/dist
	cd ant && go build -o bin/server ./cmd/server

test: test-server

test-server:
	cd ant && go test ./...
