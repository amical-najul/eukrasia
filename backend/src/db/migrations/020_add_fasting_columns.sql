-- Migration: Add fasting columns to body_measurements
-- Created at: 2026-02-02
-- Description: Adds is_fasting (boolean) and fasting_duration (decimal) for tracking fasting state during measurements.

DO $$
BEGIN
    -- Add is_fasting column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'body_measurements' AND column_name = 'is_fasting') THEN
        ALTER TABLE body_measurements ADD COLUMN is_fasting BOOLEAN DEFAULT FALSE;
    END IF;

    -- Add fasting_duration column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'body_measurements' AND column_name = 'fasting_duration') THEN
        ALTER TABLE body_measurements ADD COLUMN fasting_duration DECIMAL(5,2); -- Allows up to 999.99 hours
    END IF;
END $$;
