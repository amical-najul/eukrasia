-- Migration: 010_ai_analysis_tables.sql
-- Description: Add Analysis frequency to user config and create reports table

BEGIN;

-- 1. Update user_llm_config
ALTER TABLE user_llm_config 
ADD COLUMN IF NOT EXISTS analysis_frequency VARCHAR(20) DEFAULT 'weekly', -- 'daily', 'weekly', 'monthly', 'manual_only'
ADD COLUMN IF NOT EXISTS last_analysis_at TIMESTAMP;

-- 2. Create Reports Table
CREATE TABLE IF NOT EXISTS ai_analysis_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    report_type VARCHAR(20) NOT NULL, -- 'weekly', 'on-demand', 'daily', 'monthly'
    date_range_start TIMESTAMP NOT NULL,
    date_range_end TIMESTAMP NOT NULL,
    content TEXT, -- Markdown content
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for history
CREATE INDEX IF NOT EXISTS idx_ai_reports_user_date ON ai_analysis_reports(user_id, created_at DESC);

COMMIT;
