#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
COMPOSE_FILE="$ROOT_DIR/docker-compose.dev.yml"

echo "Starting services with docker compose..."
docker compose -f "$COMPOSE_FILE" up -d --build

echo "Waiting for backend container to be ready (timeout 60s)..."
START=$(date +%s)
while true; do
  if docker compose -f "$COMPOSE_FILE" exec -T backend python -c "print('ready')" >/dev/null 2>&1; then
    echo "Backend is responding."
    break
  fi
  NOW=$(date +%s)
  if [ $((NOW-START)) -gt 60 ]; then
    echo "Timeout waiting for backend. You can check logs with: docker compose -f $COMPOSE_FILE logs backend"
    break
  fi
  sleep 2
done

echo "Creating database tables and seeding default user inside backend container..."
docker compose -f "$COMPOSE_FILE" exec backend python create_tables.py || true
docker compose -f "$COMPOSE_FILE" exec backend python seed_user.py || true

echo "Setup complete. Access the app at: http://localhost:3000"
echo "API docs: http://localhost:8000/docs"

echo "Test accounts for quick testing:"
echo "- Admin: username=admin  password=admin123"

echo "To run backend tests inside the running container:" 
echo "  docker compose -f $COMPOSE_FILE exec backend pytest -q"

echo "If you need to stop services: docker compose -f $COMPOSE_FILE down"

exit 0
