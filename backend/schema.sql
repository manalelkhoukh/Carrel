-- ============================================================
-- Library Seat Reservation System — Database Schema
-- PostgreSQL
-- ============================================================

-- ------------------------------------------------------------
-- Extension: gen_random_uuid() for UUID primary keys
-- ------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------
-- Table: users
-- ------------------------------------------------------------
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   TEXT NOT NULL,
    role            VARCHAR(20) NOT NULL DEFAULT 'student'
                    CHECK (role IN ('student', 'admin')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- Table: rooms
-- ------------------------------------------------------------
CREATE TABLE rooms (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL UNIQUE,
    floor_number    INTEGER NOT NULL,
    opens_at        TIME NOT NULL DEFAULT '08:00',
    closes_at       TIME NOT NULL DEFAULT '22:00',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- Table: seats
-- ------------------------------------------------------------
CREATE TABLE seats (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id         UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    label           VARCHAR(10) NOT NULL,          -- e.g. "D9", "A5"
    is_active       BOOLEAN NOT NULL DEFAULT true,  -- false = out of service
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- No two seats in the same room can share a label
    CONSTRAINT unique_seat_label_per_room UNIQUE (room_id, label)
);

-- ------------------------------------------------------------
-- Table: reservations
-- ------------------------------------------------------------
CREATE TABLE reservations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    seat_id         UUID NOT NULL REFERENCES seats(id) ON DELETE CASCADE,
    start_time      TIMESTAMPTZ NOT NULL,
    end_time        TIMESTAMPTZ NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'confirmed'
                    CHECK (status IN ('confirmed', 'cancelled', 'completed')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- A reservation can't end before (or exactly when) it starts
    CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- ------------------------------------------------------------
-- Indexes — speed up the queries the app will run constantly
-- ------------------------------------------------------------
CREATE INDEX idx_seats_room_id ON seats(room_id);
CREATE INDEX idx_reservations_seat_id ON reservations(seat_id);
CREATE INDEX idx_reservations_user_id ON reservations(user_id);
CREATE INDEX idx_reservations_time_range ON reservations(seat_id, start_time, end_time);

-- ------------------------------------------------------------
-- The critical rule: NO DOUBLE-BOOKING
-- A seat cannot have two CONFIRMED reservations with overlapping times.
-- This requires the btree_gist extension to combine an equality check
-- (same seat_id) with a range overlap check (time periods).
-- ------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "btree_gist";

ALTER TABLE reservations
ADD CONSTRAINT no_overlapping_reservations
EXCLUDE USING gist (
    seat_id WITH =,
    tstzrange(start_time, end_time) WITH &&
)
WHERE (status = 'confirmed');
