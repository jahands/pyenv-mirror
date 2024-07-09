VERSION --raw-output 0.8
PROJECT jahands/docker

prepare-workspace:
	FROM --platform=linux/amd64 node:20-bookworm-slim
	WORKDIR /work
	RUN apt-get update \
		&& apt-get install -y curl jq git unzip \
		&& rm -rf /var/lib/apt/lists/*
	RUN curl -fsSL https://sh.uuid.rocks/install/rclone.sh | bash
	LET BUN_INSTALL=/usr/local
	RUN curl -fsSL https://sh.uuid.rocks/install/bun.sh | bash -s "bun-v1.1.18"

	RUN corepack prepare pnpm@latest-9 --activate
	RUN corepack enable pnpm

setup-project:
	FROM +prepare-workspace
	COPY . .

install-deps:
	FROM +setup-project
	CACHE /pnpm-store
	RUN pnpm config set store-dir /pnpm-store
	RUN pnpm install --frozen-lockfile --child-concurrency=10

sync-pyenv-mirror:
  FROM +install-deps
  RUN --push \
    --secret RCLONE_S3_ACCESS_KEY_ID \
		--secret RCLONE_S3_SECRET_ACCESS_KEY \
    bun run apps/cli/src/index.ts sync
