-- Migration: 017_protocol_customization.sql
-- Descripción: Agregar soporte para duración personalizada y fecha de inicio programada

BEGIN;

-- Agregar columnas a user_protocols
ALTER TABLE user_protocols 
ADD COLUMN IF NOT EXISTS custom_duration INT,
ADD COLUMN IF NOT EXISTS scheduled_start_date DATE;

-- Comentarios para documentación
COMMENT ON COLUMN user_protocols.custom_duration IS 'Duración personalizada elegida por el usuario (ej: 7-15 días para Anti-Cándida)';
COMMENT ON COLUMN user_protocols.scheduled_start_date IS 'Fecha programada de inicio del protocolo';

COMMIT;
