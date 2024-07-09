VERSION --raw-output 0.8
PROJECT jahands/docker

prepare-workspace:
	FROM --platform=linux/amd64 node:20-bookworm-slim
	WORKDIR /work
	RUN apt-get update \
		&& apt-get install -y \
      jq \
      git \
      curl \
      unzip \
      python3 \
      python3-pip \
      pipx \
		&& rm -rf /var/lib/apt/lists/*
	RUN curl -fsSL https://sh.uuid.rocks/install/rclone.sh | bash
	LET BUN_INSTALL=/usr/local
	RUN curl -fsSL https://sh.uuid.rocks/install/bun.sh | bash -s "bun-v1.1.18"

	RUN corepack prepare pnpm@latest-9 --activate
	RUN corepack enable pnpm

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
  SAVE ARTIFACT api/database.json AS LOCAL api/database.json

sync-pyenv-db:
  FROM +build-pyenv-db
  RUN --push \
    --secret RCLONE_S3_ACCESS_KEY_ID \
		--secret RCLONE_S3_SECRET_ACCESS_KEY \
    rclone --config apps/cli/rclone.conf \
      --s3-no-check-bucket \
      copyto api/database.json r2:pymirror/api/database.json
