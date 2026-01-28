-- Migration: 015_fix_duplicate_protocols.sql
-- Descripción: Eliminar protocolos duplicados y agregar restricción única en nombre

BEGIN;

-- Eliminar duplicados manteniendo solo el más reciente (con vinagre si aplica)
DELETE FROM protocols p1
WHERE EXISTS (
    SELECT 1 FROM protocols p2 
    WHERE p2.name = p1.name 
    AND p2.created_at > p1.created_at
);

-- Agregar restricción única en nombre para evitar futuros duplicados
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'protocols_name_unique'
    ) THEN
        ALTER TABLE protocols ADD CONSTRAINT protocols_name_unique UNIQUE (name);
    END IF;
END $$;

COMMIT;
