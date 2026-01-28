-- 019_unify_symptoms.sql
-- Remove redundant symptoms column from protocol_daily_logs
-- We are keeping metabolic_logs as the single source of truth for symptoms

ALTER TABLE protocol_daily_logs 
DROP COLUMN IF EXISTS symptoms;
