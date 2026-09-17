-- Migration: standardize library hours to 8am-8pm.
--
-- Why a migration file instead of just editing schema.sql: schema.sql
-- defines a *fresh* database from nothing — running it again would drop
-- and recreate tables, destroying your existing rooms/seats/reservations
-- data. A migration is a small, one-time script that changes an existing,
-- already-running database in place, without touching the data already
-- in it (except the specific column this one updates on purpose).

UPDATE rooms SET opens_at = '08:00', closes_at = '20:00';

ALTER TABLE rooms ALTER COLUMN opens_at SET DEFAULT '08:00';
ALTER TABLE rooms ALTER COLUMN closes_at SET DEFAULT '20:00';
