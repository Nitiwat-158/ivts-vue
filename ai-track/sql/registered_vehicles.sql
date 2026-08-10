-- ==========================================
-- User-owned registration reference vectors
-- ==========================================
-- This migration stores a stable user-owned reference vector for the
-- camera-agnostic vehicle recognition layer. It is separate from the
-- anonymous global_id ReID identity used by vehicle_logs / vehicle_identities.
--
-- A user may register one or more vehicles; each row represents one
-- vehicle identity assigned to one user account_id string.

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS registered_vehicles (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    vehicle_id TEXT NOT NULL,
    global_id INTEGER NOT NULL,
    reference_vector VECTOR(512) NOT NULL,
    nickname TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_registered_vehicles_user_id
    ON registered_vehicles (user_id);

CREATE INDEX IF NOT EXISTS idx_registered_vehicles_vehicle_id
    ON registered_vehicles (vehicle_id);

CREATE INDEX IF NOT EXISTS idx_registered_vehicles_global_id
    ON registered_vehicles (global_id);

CREATE UNIQUE INDEX IF NOT EXISTS ux_registered_vehicles_user_vehicle
    ON registered_vehicles (user_id, vehicle_id);

-- Optional future acceleration point once the table is non-trivial:
-- CREATE INDEX idx_registered_vehicles_vector
--     ON registered_vehicles USING hnsw (reference_vector vector_cosine_ops);
