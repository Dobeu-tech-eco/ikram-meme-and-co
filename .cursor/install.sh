#!/usr/bin/env bash
# One-time (idempotent) setup for the Ikram & Co. Cloud Agent environment.
# Runs after the repo is checked out. Must terminate and be safe to re-run.
#
# What lives here (durable, snapshot-able state):
#   - Node dependencies (pnpm)
#   - System packages needed to run a local Supabase stack via Docker-in-VM
#   - Playwright's Chromium (for `pnpm test:e2e`)
#   - Docker daemon + FUSE config files
#
# Per-boot service startup (dockerd, `supabase start`) lives in start.sh instead.
set -euo pipefail
cd "$(dirname "$0")/.."

echo "==> Installing Node dependencies"
# Pin the package manager to the version that produced pnpm-lock.yaml so corepack
# doesn't silently upgrade pnpm (a newer pnpm tries to purge node_modules).
corepack enable >/dev/null 2>&1 || true
corepack prepare pnpm@10.33.3 --activate >/dev/null 2>&1 || true
CI=true pnpm install --frozen-lockfile

echo "==> Installing system packages for local Supabase (Docker-in-VM)"
if ! command -v dockerd >/dev/null 2>&1 || ! command -v fuse-overlayfs >/dev/null 2>&1; then
  sudo apt-get update -qq
  sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq --no-install-recommends \
    docker.io fuse-overlayfs iptables uidmap
fi

echo "==> Configuring FUSE + Docker daemon"
# fuse-overlayfs is the only storage driver that works on the nested overlay FS.
if ! grep -q '^user_allow_other' /etc/fuse.conf 2>/dev/null; then
  echo user_allow_other | sudo tee -a /etc/fuse.conf >/dev/null
fi
sudo mkdir -p /etc/docker
printf '{\n  "storage-driver": "fuse-overlayfs"\n}\n' | sudo tee /etc/docker/daemon.json >/dev/null

echo "==> Installing Playwright Chromium"
pnpm exec playwright install --with-deps chromium || pnpm exec playwright install chromium || true

echo "==> install.sh complete"
