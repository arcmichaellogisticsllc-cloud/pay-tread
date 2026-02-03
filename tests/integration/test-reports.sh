#!/usr/bin/env bash
# Quick integration smoke test for new report endpoints
set -euo pipefail
BASE=http://localhost:3000
echo "Carrier CSV:";
curl -sS -H "x-user-email: carrier@example.com" "$BASE/api/reports/carrier/earnings?month=2026-02&format=csv" | sed -n '1,20p'

echo "\nBroker JSON sample:";
curl -sS -H "x-user-email: broker@example.com" "$BASE/api/reports/broker/payables" | jq '.data | length, .[0]' || true

echo "\nAdmin ledger sample (uses ADMIN_TOKEN env var):";
if [ -z "${ADMIN_TOKEN-}" ]; then
  echo "Skipping admin test (ADMIN_TOKEN not set)";
else
  curl -sS -H "x-admin-token: $ADMIN_TOKEN" "$BASE/api/admin/reports/ledger" | jq '.data | length' || true
fi
