-- Word Wave's database role (class standard Phase 5, work order criterion 4).
--
-- Run once, by hand, against the portal's Supabase database as `postgres` (the portal's
-- POSTGRES_URL_NON_POOLING). The password is supplied at run time, never stored here:
--
--   psql "$POSTGRES_URL_NON_POOLING" -v wordwave_password="$(openssl rand -hex 24)" -f docs/db/wordwave-role.sql
--
-- The role owns the tables in schema `wordwave` and nothing else. It is granted nothing on `public`,
-- `auth` or `storage`, so Word Wave's connection string cannot read or write the
-- school's accounts or reward ledger; the ledger is credited only through the portal's
-- RPCs with the learner's own token.

create role wordwave_app with login password :'wordwave_password' noinherit;

-- Owned by the running role (`postgres`, which on Supabase is not a superuser and cannot
-- SET ROLE to a new role, so `authorization wordwave_app` is refused); wordwave_app gets
-- usage and create, and owns every table its migrations create.
create schema wordwave;
grant usage, create on schema wordwave to wordwave_app;

-- Supabase's API roles get nothing here; the schema is not in the Data API's exposed list.
revoke all on schema wordwave from public, anon, authenticated;

-- Prisma resolves unqualified names through the search path.
alter role wordwave_app set search_path = wordwave;
