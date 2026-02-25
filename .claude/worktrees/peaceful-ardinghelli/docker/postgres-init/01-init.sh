#!/usr/bin/env bash
# =============================================================================
# PostgreSQL init script — runs ONCE on first container start (empty data dir).
# Creates the dump-owner role alias and restores the dump.sql.gz snapshot.
# POSTGRES_USER / POSTGRES_PASSWORD / POSTGRES_DB are already created by the
# official postgres image before this script runs.
# =============================================================================
set -euo pipefail

DB_NAME="${POSTGRES_DB}"
DB_SUPER="${POSTGRES_USER}"

echo "=== [init] Creating dump-owner role alias 'devenvir_devenvir_billing_prod' ==="

psql -v ON_ERROR_STOP=0 -U "${DB_SUPER}" -d postgres <<-EOSQL
    -- The dump references this role as table owner.
    -- Map it to the same superuser so GRANT/ALTER work cleanly.
    DO \$\$
    BEGIN
        IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'devenvir_devenvir_billing_prod') THEN
            CREATE ROLE "devenvir_devenvir_billing_prod" LOGIN PASSWORD '${POSTGRES_PASSWORD}';
            GRANT ALL PRIVILEGES ON DATABASE "${DB_NAME}" TO "devenvir_devenvir_billing_prod";
        END IF;
    END
    \$\$;
EOSQL

echo "=== [init] Restoring dump.sql.gz into '${DB_NAME}' ==="

DUMP_FILE="/docker-entrypoint-initdb.d/dump.sql.gz"
if [ -f "${DUMP_FILE}" ]; then
    gunzip -c "${DUMP_FILE}" | psql \
        -v ON_ERROR_STOP=0 \
        -U "${DB_SUPER}" \
        -d "${DB_NAME}" 2>&1 | grep -E "(ERROR|WARNING|FATAL|restore)" || true
    echo "=== [init] Restore complete ==="
else
    echo "=== [init] WARNING: dump not found — skipping restore ==="
fi
