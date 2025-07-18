#!/usr/bin/env bash
set -e

# 1. Install all dependencies
pnpm install

# 2. Copy .env.example if .env does not exist
if [ -f .env.example ] && [ ! -f .env ]; then
  cp .env.example .env
fi

# 3. Lint, typecheck, test, build
pnpm run lint
pnpm run typecheck
pnpm run test
pnpm run build

echo "✅ JobFit AI setup complete!"

