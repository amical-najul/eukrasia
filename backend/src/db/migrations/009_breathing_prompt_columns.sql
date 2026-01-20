-- Migration: Add inhale_prompt and exhale_prompt columns to breathing_configurations
-- Date: 2026-01-20
-- Description: Adds missing boolean columns for inhale/exhale audio prompt preferences

ALTER TABLE breathing_configurations 
  ADD COLUMN IF NOT EXISTS inhale_prompt BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS exhale_prompt BOOLEAN DEFAULT TRUE;

-- Update any existing records to have the default values
UPDATE breathing_configurations 
SET inhale_prompt = TRUE, exhale_prompt = TRUE 
WHERE inhale_prompt IS NULL OR exhale_prompt IS NULL;
