-- ==========================================
-- MFU Vehicle Tracking - Database Schema
-- ==========================================
-- Run this once against a fresh database:
--   psql -U postgres -d mfu_vehicle_track -f schema.sql
--
-- Requires the pgvector extension (https://github.com/pgvector/pgvector)

CREATE EXTENSION IF NOT EXISTS vector;

-- ------------------------------------------
-- vehicle_identities
-- One row per PHYSICAL vehicle (cross-camera identity).
-- This is what ties detections from CAM01, CAM05, CAM09, etc.
-- into a single "vehicle" that the frontend can draw one polyline for.
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS vehicle_identities (
    global_id   SERIAL PRIMARY KEY,
    first_seen  TIMESTAMP NOT NULL DEFAULT NOW(),
    last_seen   TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ------------------------------------------
-- vehicle_logs
-- One row per detection event (a specific camera, at a specific time).
-- track_id is the LOCAL ByteTrack id (only unique within that camera's
-- current run) - kept for debugging/audit, but NOT used for cross-camera
-- matching or timeline queries anymore. global_id is used for that.
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS vehicle_logs (
    log_id           SERIAL PRIMARY KEY,
    global_id        INTEGER REFERENCES vehicle_identities(global_id) ON DELETE SET NULL,
    track_id         INTEGER NOT NULL,
    camera_id        VARCHAR(50) NOT NULL,
    timestamp        TIMESTAMP NOT NULL DEFAULT NOW(),
    live_vector      VECTOR(512) NOT NULL,
    predicted_class  VARCHAR(50),
    detected_lat     DOUBLE PRECISION,  -- per-detection GPS from homography calibration, if the camera has one (see config/homography_calibration.yaml). NULL = use the camera's fixed lat/lng instead (API handles the fallback).
    detected_lng     DOUBLE PRECISION,
    box_area         DOUBLE PRECISION   -- bounding box pixel area at detection time, used to weight multi-camera fusion (larger/clearer box = more trusted position)
);

CREATE INDEX IF NOT EXISTS idx_vehicle_logs_global_id     ON vehicle_logs (global_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_logs_camera_time   ON vehicle_logs (camera_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_vehicle_logs_timestamp     ON vehicle_logs (timestamp);

-- Approximate nearest-neighbour index for cosine distance search.
-- Build this AFTER you have a meaningful amount of data (e.g. a few thousand
-- rows), then ANALYZE. With 10 cameras running continuously this table will
-- grow fast, so this index matters for keeping the real-time matcher fast.
--
-- CREATE INDEX idx_vehicle_logs_vector ON vehicle_logs
--     USING ivfflat (live_vector vector_cosine_ops) WITH (lists = 100);
-- ANALYZE vehicle_logs;

-- ------------------------------------------
-- MIGRATING AN EXISTING DATABASE (if you already have data from an older schema)
-- ------------------------------------------
-- ALTER TABLE vehicle_logs ADD COLUMN IF NOT EXISTS global_id INTEGER REFERENCES vehicle_identities(global_id);
-- ALTER TABLE vehicle_logs ADD COLUMN IF NOT EXISTS detected_lat DOUBLE PRECISION;
-- ALTER TABLE vehicle_logs ADD COLUMN IF NOT EXISTS detected_lng DOUBLE PRECISION;
-- ALTER TABLE vehicle_logs ADD COLUMN IF NOT EXISTS box_area DOUBLE PRECISION;
--
-- Then backfill: give every existing row its own global_id (1 vehicle = 1 old row),
-- or re-run the matcher over historical data if you want real cross-camera linking.
-- A simple "1 row = 1 new identity" backfill:
--
-- INSERT INTO vehicle_identities (first_seen, last_seen)
-- SELECT timestamp, timestamp FROM vehicle_logs WHERE global_id IS NULL;
--
-- (then match global_id back by row order - see tools/backfill_global_id.py if needed)