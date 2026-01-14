-- Migration: 003_metabolic_logs.sql
-- Description: Create Unified Metabolic Event Log table
-- FIXED: user_id type changed to INTEGER to match existing users table

BEGIN;

-- Create Enum Type for Events
DO $$ BEGIN
    CREATE TYPE event_type_enum AS ENUM ('CONSUMO', 'INICIO_AYUNO', 'SINTOMA');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create Metabolic Logs Table
CREATE TABLE IF NOT EXISTS metabolic_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_type event_type_enum NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'HIDRATACION', 'SUPLEMENTO_AM', 'COMIDA_REAL', 'SINTOMA'
    item_name VARCHAR(100) NOT NULL,
    is_fasting_breaker BOOLEAN DEFAULT FALSE,
    image_url TEXT, -- MinIO URL
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster queries on user history and fasting calculation
CREATE INDEX IF NOT EXISTS idx_metabolic_user_date ON metabolic_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_metabolic_fasting_breaker ON metabolic_logs(user_id, created_at DESC) WHERE is_fasting_breaker = TRUE;
CREATE INDEX IF NOT EXISTS idx_metabolic_start_fasting ON metabolic_logs(user_id, created_at DESC) WHERE event_type = 'INICIO_AYUNO';

COMMIT;
