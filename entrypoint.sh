#!/usr/bin/env bash
set -euo pipefail

# Apply migrations to your PostgreSQL database
python manage.py migrate --noinput

# Collect static files for the UI
python manage.py collectstatic --noinput

# Run server (cPanel usually handles the port, but 8000 is standard)
python manage.py runserver 0.0.0.0:8000