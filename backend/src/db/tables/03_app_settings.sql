-- =============================================
-- TABLA: app_settings
-- Descripción: Configuraciones del sistema (SMTP, Branding, OAuth, etc.)
-- =============================================

CREATE TABLE IF NOT EXISTS app_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índice para búsqueda rápida por clave
CREATE INDEX IF NOT EXISTS idx_app_settings_key ON app_settings(setting_key);

-- =============================================
-- CLAVES UTILIZADAS:
-- =============================================
-- SMTP:
--   smtp_enabled, smtp_sender_email, smtp_host, smtp_port
--   smtp_user, smtp_pass, smtp_secure
--
-- Branding:
--   app_name, app_favicon_url
--
-- Google OAuth:
--   google_oauth_enabled, google_client_id, google_client_secret
--
-- IA / LLM:
--   Primary: llm_provider, llm_model, llm_api_key
--   Secondary: llm_provider_secondary, llm_model_secondary, llm_api_key_secondary
-- =============================================
