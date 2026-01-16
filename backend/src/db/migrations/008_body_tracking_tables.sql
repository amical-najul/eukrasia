-- Migration: 008_body_tracking_tables.sql
-- Description: Body Tracking Tables (Weight & Measurements)
-- Fixed: Removed BEGIN/COMMIT to avoid nested transaction issues with runner

-- Ensure UUID generation functions exist
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Body Weight Logs
CREATE TABLE IF NOT EXISTS body_weight_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    weight NUMERIC(5,2) NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    note TEXT
);

CREATE INDEX IF NOT EXISTS idx_body_weight_recorded_at ON body_weight_logs(user_id, recorded_at DESC);

-- 2. Body Weight Goals
CREATE TABLE IF NOT EXISTS body_weight_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_weight NUMERIC(5,2) NOT NULL,
    target_weight NUMERIC(5,2) NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    target_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Body Measurements
CREATE TABLE IF NOT EXISTS body_measurements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    measurement_type VARCHAR(50) NOT NULL,
    value NUMERIC(5,2) NOT NULL,
    unit VARCHAR(10) DEFAULT 'cm',
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    note TEXT
);

CREATE INDEX IF NOT EXISTS idx_body_measurements_type_date ON body_measurements(user_id, measurement_type, recorded_at DESC);
