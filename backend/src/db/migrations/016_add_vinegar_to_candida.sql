-- Migration: 016_add_vinegar_to_candida.sql
-- Descripción: Agregar paso de Vinagre de Manzana al protocolo Anti-Cándida

BEGIN;

-- Agregar vinagre_manzana al inicio del array de tareas de Anti-Cándida
UPDATE protocols 
SET daily_tasks = (
    '[{"id": "vinagre_manzana", "name": "Vinagre de Manzana (Min -15)", "description": "Vaso de agua grande con 1 Cda de Vinagre de Manzana, 15 min antes de comer. Prepara el pH del estomago.", "icon": "🍎", "required": true, "order": 0}]'::jsonb || daily_tasks
)
WHERE name = 'Anti-Cándida' 
AND NOT daily_tasks @> '[{"id": "vinagre_manzana"}]'::jsonb;

COMMIT;
