-- Migration: 004_sleep_sessions.sql
-- Description: Create Sleep Sessions table for self-reporting

BEGIN;

CREATE TABLE IF NOT EXISTS sleep_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    quality_score INTEGER DEFAULT 0,
    symptoms TEXT[] DEFAULT '{}',
    apnea_flag BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for history and active session lookups
CREATE INDEX IF NOT EXISTS idx_sleep_user_active ON sleep_sessions(user_id) WHERE end_time IS NULL;
CREATE INDEX IF NOT EXISTS idx_sleep_user_history ON sleep_sessions(user_id, start_time DESC);

COMMIT;
