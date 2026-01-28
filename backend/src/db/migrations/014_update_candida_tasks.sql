-- Migration: 014_update_candida_tasks.sql
-- Descripción: Agregar paso de Vinagre de Manzana al protocolo Anti-Cándida

BEGIN;

DO $$ 
DECLARE
    protocol_id UUID;
    new_task JSONB;
BEGIN
    SELECT id INTO protocol_id FROM protocols WHERE name = 'Anti-Cándida';
    
    new_task := '{
        "id": "vinagre_manzana", 
        "name": "Vinagre de Manzana (Min -15)", 
        "description": "Vaso de agua grande con 1 cucharada de Vinagre de Manzana. (Bébelo 15 min antes de tu \"hora de comer\"). Efecto: Prepara el pH del estómago y engaña al hambre final.", 
        "icon": "🍎", 
        "required": true, 
        "order": 0
    }';

    -- Actualizar solo si la tarea no existe ya (idempotencia básica verificando el ID en el json string, 
    -- aunque jsonb search es mejor, esto es simple para array de objetos)
    IF EXISTS (SELECT 1 FROM protocols WHERE id = protocol_id AND NOT daily_tasks @> '[{"id": "vinagre_manzana"}]') THEN
        UPDATE protocols 
        SET daily_tasks = daily_tasks || new_task
        WHERE id = protocol_id;
    END IF;
END $$;

COMMIT;
