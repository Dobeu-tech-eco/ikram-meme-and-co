#!/usr/bin/env bash
# Per-boot startup for the Ikram & Co. Cloud Agent environment.
# Brings up Docker + the local Supabase stack, writes .env.local, then hands off
# to the Next.js dev server in the foreground (stays attached for the agent).
#
# The setup portion is idempotent: safe to run repeatedly; a no-op when already up.
set -euo pipefail
cd "$(dirname "$0")/.."

echo "==> Ensuring Docker daemon is running"
if ! sudo docker info >/dev/null 2>&1; then
  sudo mkdir -p /etc/docker
  printf '{\n  "storage-driver": "fuse-overlayfs"\n}\n' | sudo tee /etc/docker/daemon.json >/dev/null
  sudo "$(command -v dockerd)" >/tmp/dockerd.log 2>&1 &
  for _ in $(seq 1 60); do
    sudo docker info >/dev/null 2>&1 && break
    sleep 1
  done
fi
sudo chmod 666 /var/run/docker.sock 2>/dev/null || true

# Docker's user-defined bridge networks (used by the Supabase stack for
# container-to-container traffic) are blocked by the legacy iptables FORWARD
# chain, which defaults to DROP in this nested VM. Allow forwarding so the
# Supabase containers can reach each other and Postgres.
echo "==> Allowing Docker bridge forwarding"
sudo iptables-legacy -P FORWARD ACCEPT 2>/dev/null || true

echo "==> Starting local Supabase (applies migrations + seed; idempotent)"
pnpm supabase start

echo "==> Writing .env.local from the running Supabase stack"
./scripts/setup-local-env.sh

echo "==> Starting Next.js dev server (foreground) on http://localhost:3000"
exec pnpm dev
