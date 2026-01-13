-- Tabla para traducciones multi-idioma
CREATE TABLE IF NOT EXISTS translations (
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'common',
    translations JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_translations_key ON translations(key);
CREATE INDEX IF NOT EXISTS idx_translations_category ON translations(category);

-- Comentario: Las traducciones se almacenan en formato JSONB:
-- { "es": "Texto en español", "pt": "Texto em português", "en": "Text in English" }
