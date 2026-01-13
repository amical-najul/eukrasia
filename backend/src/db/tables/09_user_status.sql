-- =============================================
-- MIGRATION: 09_user_status
-- Descripción: Agrega columna 'status' y migra 'active' bool a 'active'/'inactive' status.
-- =============================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';

-- Migrar datos actuales
UPDATE users SET status = 'active' WHERE active = TRUE;
UPDATE users SET status = 'inactive' WHERE active = FALSE;

-- Index para status
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
