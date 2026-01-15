-- Migration: 005_database_consistency_fixes.sql
-- Description: Fix database inconsistencies identified during audit
-- Date: 2026-01-15
-- Changes:
--   1. Add 'NOTA' to event_type_enum for metabolic_logs
--   2. Add inhale_prompt and exhale_prompt columns to breathing_configurations
--   3. Standardize timezone handling for mind_sessions and mind_configurations
--   4. Add module column to global_audio_files

BEGIN;

-- =====================================================
-- 1. EXPAND ENUM: Add 'NOTA' to event_type_enum
-- =====================================================
-- Note: PostgreSQL doesn't allow removing enum values easily,
-- so we only add new ones. Existing 'SINTOMA' usage for notes is still valid.

DO $$ 
BEGIN
    -- Add 'NOTA' value if it doesn't exist
    ALTER TYPE event_type_enum ADD VALUE IF NOT EXISTS 'NOTA';
EXCEPTION
    WHEN duplicate_object THEN 
        RAISE NOTICE 'NOTA value already exists in event_type_enum';
END $$;

-- =====================================================
-- 2. ADD MISSING COLUMNS: breathing_configurations
-- =====================================================
-- These columns control inhale/exhale audio prompts

ALTER TABLE breathing_configurations 
ADD COLUMN IF NOT EXISTS inhale_prompt BOOLEAN DEFAULT TRUE;

ALTER TABLE breathing_configurations 
ADD COLUMN IF NOT EXISTS exhale_prompt BOOLEAN DEFAULT TRUE;

-- =====================================================
-- 3. STANDARDIZE TIMEZONE: mind_sessions
-- =====================================================
-- Convert TIMESTAMP to TIMESTAMP WITH TIME ZONE for consistency

ALTER TABLE mind_sessions 
ALTER COLUMN created_at TYPE TIMESTAMP WITH TIME ZONE 
USING created_at AT TIME ZONE 'UTC';

-- =====================================================
-- 4. STANDARDIZE TIMEZONE: mind_configurations
-- =====================================================

ALTER TABLE mind_configurations 
ALTER COLUMN updated_at TYPE TIMESTAMP WITH TIME ZONE 
USING updated_at AT TIME ZONE 'UTC';

-- =====================================================
-- 5. ADD MODULE FIELD: global_audio_files
-- =====================================================
-- Distinguish between breathing vs. mind audio files

ALTER TABLE global_audio_files 
ADD COLUMN IF NOT EXISTS module VARCHAR(20) DEFAULT 'breathing';

-- Update existing records to have explicit module
UPDATE global_audio_files 
SET module = 'breathing' 
WHERE module IS NULL;

-- =====================================================
-- 6. CREATE INDEXES FOR NEW COLUMNS
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_global_audio_module 
ON global_audio_files(module, category);

COMMIT;
