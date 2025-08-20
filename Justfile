set shell := ["bash", "-c"]

[private]
@help:
  just --list --unsorted

# Build the pyenv database locally
build:
  dagger call build-pyenv-db export --path=api/

# Sync the pyenv database to R2 (requires AWS credentials)
sync:
  dagger call sync-pyenv-db \
    --AWS_ACCESS_KEY_ID=env:AWS_ACCESS_KEY_ID \
    --AWS_SECRET_ACCESS_KEY=env:AWS_SECRET_ACCESS_KEY

# Build and sync in one command
build-sync: build sync

# Helpers for Dagger development
dagger-dev:
  dagger develop

# Initialize/update Dagger dependencies
dagger-init:
  cd .dagger && npm install
