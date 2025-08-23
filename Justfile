set shell := ["bash", "-c"]

[private]
@help:
  just --list --unsorted

alias fmt := format

# Build the pyenv database locally
build:
  dagger call build-pyenv-db export --path=./api/database.json

# Sync the pyenv database to R2 (requires AWS credentials)
sync:
  dagger call sync-pyenv-db \
    --AWS_ACCESS_KEY_ID=env://AWS_ACCESS_KEY_ID \
    --AWS_SECRET_ACCESS_KEY=env://AWS_SECRET_ACCESS_KEY

# Build and sync in one command
build-sync: build sync

# Helpers for Dagger development
dagger-dev:
  dagger develop
  @rm .dagger/.gitignore .dagger/.gitattributes

# Fix dependencies and format code
fix:
  #!/bin/bash
  if git diff --name-only HEAD | grep -q "package\.json"; then
    bun syncpack fix-mismatches
    just install
    just format
  else
    just format
  fi

# Format code
format:
  bun prettier --cache --write --log-level=warn .

# Fix dependencies
fix-deps:
  #!/bin/bash
  if git diff --name-only HEAD | grep -q "package\.json"; then
    bun syncpack fix-mismatches
    just install
    just format
  fi

# Install dependencies
install:
  pnpm install --child-concurrency=10

# Update dependencies with
update-deps:
  #!/bin/bash
  bun syncpack update
  just fix-deps

