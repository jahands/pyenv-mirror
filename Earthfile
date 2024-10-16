VERSION --raw-output 0.8
PROJECT jahands/docker

prepare-workspace:
	FROM debian:bookworm-slim
	WORKDIR /work
	RUN apt-get update && \
		apt-get install -y \
			jq \
			git \
			curl \
			unzip \
			python3 \
			python3-pip \
			pipx && \
		rm -rf /var/lib/apt/lists/*

	RUN curl -fsSL https://sh.uuid.rocks/install/mise | bash
	ENV PATH="$HOME/.local/share/mise/shims:$HOME/.local/bin:$PATH"
	COPY .mise.toml .
	RUN mise install --yes && mise reshim

setup-project:
	FROM +prepare-workspace
	COPY . .

install-node-deps:
	FROM +setup-project
	CACHE /pnpm-store
	RUN pnpm config set store-dir /pnpm-store
	RUN pnpm install --frozen-lockfile --child-concurrency=10

build-pyenv-db:
	FROM +install-node-deps
	# RUN python3 build.py
	RUN bun run apps/cli/src/index.ts build
	RUN bun run apps/cli/src/index.ts verify
	SAVE ARTIFACT api/database.json
	SAVE ARTIFACT api/database.json AS LOCAL api/database.json

sync-pyenv-db:
	FROM +install-node-deps
	BUILD +build-pyenv-db
	COPY +build-pyenv-db/database.json .
	RUN --push \
		--secret AWS_ACCESS_KEY_ID \
		--secret AWS_SECRET_ACCESS_KEY \
		rclone --config apps/cli/rclone.conf \
			--s3-no-check-bucket \
			copyto database.json r2:pymirror/api/database.json
