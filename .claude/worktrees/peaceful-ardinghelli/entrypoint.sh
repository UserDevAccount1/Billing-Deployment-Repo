#!/usr/bin/env bash
set -euo pipefail

echo "=== PostgreSQL is healthy (guaranteed by docker-compose depends_on) ==="

# Apply any pending migrations
echo "=== Running migrations ==="
python manage.py migrate --noinput

# Collect static files
echo "=== Collecting static files ==="
python manage.py collectstatic --noinput

# Start Django dev server
echo "=== Starting Django on 0.0.0.0:8000 ==="
python manage.py runserver 0.0.0.0:8000
