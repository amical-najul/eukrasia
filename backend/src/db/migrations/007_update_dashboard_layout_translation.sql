-- Migration: 007_update_dashboard_layout_translation.sql
-- Description: Update dashboard layout setting name to 'Visualización Vertical dashboard'
-- Date: 2026-01-15

BEGIN;

INSERT INTO translations (key, category, translations) VALUES
('settings.dashboardLayout', 'settings', '{"es": "Visualización Vertical dashboard", "pt": "Visualização Vertical do Dashboard", "en": "Vertical Dashboard View"}'),
('settings.dashboardLayout_desc', 'settings', '{"es": "Cambiar entre vista de hexágonos y lista.", "pt": "Alternar entre vista de hexágonos e lista.", "en": "Switch between hexagon and list view."}')
ON CONFLICT (key) DO UPDATE SET 
    translations = EXCLUDED.translations,
    updated_at = CURRENT_TIMESTAMP;

COMMIT;
