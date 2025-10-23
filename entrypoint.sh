#!/usr/bin/env bash
set -euo pipefail

# Wait for MySQL if configured
if [ -n "${MYSQL_HOST:-}" ]; then
  echo "Waiting for MySQL at ${MYSQL_HOST}:${MYSQL_PORT:-3306}..."
  until nc -z "${MYSQL_HOST}" "${MYSQL_PORT:-3306}"; do
    sleep 1
  done
  echo "MySQL is up."
fi

# Apply migrations
python manage.py migrate --noinput

# Collect static files
python manage.py collectstatic --noinput

# Run server
python manage.py runserver 0.0.0.0:8000
