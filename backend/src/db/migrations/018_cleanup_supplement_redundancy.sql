-- Migration: 018_cleanup_supplement_redundancy.sql
-- Descripción: Limpiar redundancia de suplementos y normalizar IDs

BEGIN;

-- 1. Eliminar entradas huérfanas de SUPLEMENTO en metabolic_logs
-- Estos datos ahora solo existen en supplement_logs
DELETE FROM metabolic_logs 
WHERE category = 'SUPLEMENTO';

-- 2. Agregar columna UUID a supplement_logs (mantener SERIAL como backup temporal)
ALTER TABLE supplement_logs 
ADD COLUMN IF NOT EXISTS uuid_id UUID DEFAULT gen_random_uuid();

-- 3. Actualizar UUIDs para registros existentes
UPDATE supplement_logs SET uuid_id = gen_random_uuid() WHERE uuid_id IS NULL;

-- 4. Agregar constraint NOT NULL después de poblar
ALTER TABLE supplement_logs ALTER COLUMN uuid_id SET NOT NULL;

-- 5. Crear índice para el nuevo UUID
CREATE INDEX IF NOT EXISTS idx_supplement_logs_uuid ON supplement_logs(uuid_id);

COMMENT ON TABLE supplement_logs IS 'Tabla única para tracking de suplementos diarios. No duplicar en metabolic_logs.';

COMMIT;
