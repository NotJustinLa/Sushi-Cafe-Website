#!/bin/bash
# Quick check that the register API is up, using the bearer key (no browser).
#   ./scripts/register-smoke.sh            (defaults to http://localhost:3000)
#   ./scripts/register-smoke.sh https://your-domain
# Read-only: lists tables and active orders; changes nothing.
set -euo pipefail
cd "$(dirname "$0")/.."
BASE="${1:-http://localhost:3000}"
KEY=$(grep '^REGISTER_API_KEY=' .env.local | cut -d= -f2)
AUTH="Authorization: Bearer $KEY"

echo "Tables:";        curl -sf -H "$AUTH" "$BASE/api/register/tables"; echo
echo "Active orders:"; curl -sf -H "$AUTH" "$BASE/api/register/orders"; echo
echo -n "Without a key (expect 401): "; curl -s -o /dev/null -w '%{http_code}\n' "$BASE/api/register/tables"

# Changing things (uncomment to use):
# curl -X POST  -H "$AUTH" "$BASE/api/register/tables/7/open"
# curl -X PATCH -H "$AUTH" -H 'Content-Type: application/json' -d '{"status":"ready"}' "$BASE/api/register/orders/42"
# curl         -H "$AUTH" "$BASE/api/register/tables/7/bill"
# curl -X POST  -H "$AUTH" "$BASE/api/register/tables/7/close"
