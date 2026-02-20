#!/usr/bin/env bash
# =============================================================================
# Excis Billing — n8n Standalone docker run
# Use this if you want to spin up n8n WITHOUT docker-compose.
# For the full stack (billing web + n8n together) use: docker compose up
# =============================================================================

set -euo pipefail

# ── Configuration ─────────────────────────────────────────────────────────────
N8N_HOST="${N8N_HOST:-localhost}"
N8N_PORT="${N8N_PORT:-5678}"
N8N_PROTOCOL="${N8N_PROTOCOL:-http}"
N8N_BASIC_AUTH_USER="${N8N_BASIC_AUTH_USER:-admin}"
N8N_BASIC_AUTH_PASSWORD="${N8N_BASIC_AUTH_PASSWORD:-changeme}"
N8N_ENCRYPTION_KEY="${N8N_ENCRYPTION_KEY:-change-this-encryption-key-32chars}"
GENERIC_TIMEZONE="${GENERIC_TIMEZONE:-UTC}"

# Path to the workflow JSON (relative to this script or absolute)
WORKFLOW_JSON="$(cd "$(dirname "$0")" && pwd)/AI_Billing_Orchestrator_v2.0.json"

# ── Run n8n ───────────────────────────────────────────────────────────────────
docker run \
  --name excis-n8n \
  --restart unless-stopped \
  -d \
  -p "${N8N_PORT}:5678" \
  \
  -e N8N_HOST="${N8N_HOST}" \
  -e N8N_PORT="5678" \
  -e N8N_PROTOCOL="${N8N_PROTOCOL}" \
  -e WEBHOOK_URL="${N8N_PROTOCOL}://${N8N_HOST}:${N8N_PORT}/" \
  \
  -e N8N_BASIC_AUTH_ACTIVE="true" \
  -e N8N_BASIC_AUTH_USER="${N8N_BASIC_AUTH_USER}" \
  -e N8N_BASIC_AUTH_PASSWORD="${N8N_BASIC_AUTH_PASSWORD}" \
  \
  -e N8N_ENCRYPTION_KEY="${N8N_ENCRYPTION_KEY}" \
  \
  -e GENERIC_TIMEZONE="${GENERIC_TIMEZONE}" \
  -e TZ="${GENERIC_TIMEZONE}" \
  \
  -e N8N_DEFAULT_BINARY_DATA_MODE="filesystem" \
  -e N8N_IMPORT_WORKFLOWS="/home/node/workflows" \
  \
  -v excis-n8n-data:/home/node/.n8n \
  -v "${WORKFLOW_JSON}:/home/node/workflows/AI_Billing_Orchestrator_v2.0.json:ro" \
  \
  --add-host host.docker.internal:host-gateway \
  \
  docker.n8n.io/n8nio/n8n:latest

echo ""
echo "✅  n8n is starting — container: excis-n8n"
echo "   UI  → ${N8N_PROTOCOL}://${N8N_HOST}:${N8N_PORT}/"
echo "   User: ${N8N_BASIC_AUTH_USER}"
echo "   Pass: ${N8N_BASIC_AUTH_PASSWORD}"
echo ""
echo "   The 'AI Billing Orchestrator v2.0' workflow is auto-imported."
echo "   Open the UI, go to Credentials, and add your Anthropic API key."
echo ""
echo "To view logs:  docker logs -f excis-n8n"
echo "To stop:       docker stop excis-n8n && docker rm excis-n8n"
