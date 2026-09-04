#!/usr/bin/env bash
# Runs the row-level-security suite against a throwaway local Postgres.
#
# This does NOT need Supabase or Docker. 00_supabase_stubs.sql stands in for
# the pieces Supabase normally supplies (auth.users, auth.uid(), the storage
# schema), so the same migration that runs in production can be exercised on a
# plain Postgres 16.
#
#   ./supabase/tests/run.sh
#
# Every check prints PASS or the value it found next to the value expected.
# The suite asserts, among others, that a member cannot promote themselves to
# admin, publish or verify their own listing, or touch another member's rows,
# and that a pending applicant cannot list at all.

set -euo pipefail

PORT="${PGPORT:-55432}"
DB=mpu_rls_test
HERE="$(cd "$(dirname "$0")" && pwd)"
PSQL="psql -h /tmp -p $PORT -U postgres"

if ! $PSQL -d postgres -tAc 'select 1' >/dev/null 2>&1; then
  echo "No Postgres on port $PORT."
  echo "Start one, e.g.:"
  echo "  initdb -D /tmp/pgdata -U postgres --auth=trust"
  echo "  pg_ctl -D /tmp/pgdata -o '-p $PORT -k /tmp' start"
  exit 1
fi

$PSQL -d postgres -q -c "drop database if exists $DB;" -c "create database $DB;"
$PSQL -d $DB -q -v ON_ERROR_STOP=1 -f "$HERE/00_supabase_stubs.sql"
$PSQL -d $DB -q -v ON_ERROR_STOP=1 -f "$HERE/../migrations/0001_init.sql"

# Grants Supabase makes for you; needed only because the stubs create the
# auth schema from scratch.
$PSQL -d $DB -q -c "grant usage on schema auth to anon, authenticated;
                    grant execute on function auth.uid() to anon, authenticated;"

$PSQL -d $DB -f "$HERE/01_rls_test.sql"

echo
echo "Done. Any line reading FAIL is a policy that is not doing its job."
