-- Tabla de Usuarios para la Aplicación Base
-- Esta tabla maneja la autenticación local y con Google.
-- Se incluye la columna 'role' para gestión de permisos (user/admin).

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user',
    name VARCHAR(255),
    avatar_url TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indices recomendados para performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Tabla de Plantillas de Email para Autenticación
CREATE TABLE IF NOT EXISTS email_templates (
    id SERIAL PRIMARY KEY,
    template_key VARCHAR(50) UNIQUE NOT NULL,
    sender_name VARCHAR(255),
    sender_email VARCHAR(255),
    reply_to VARCHAR(255),
    subject VARCHAR(500) NOT NULL,
    body_html TEXT NOT NULL,
    body_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Configuraciones del Sistema (incluyendo SMTP)
CREATE TABLE IF NOT EXISTS app_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Tokens de Restablecimiento de Contraseña
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);

-- Tabla de Tokens de Cambio de Email
CREATE TABLE IF NOT EXISTS email_change_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    new_email VARCHAR(255) NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_email_change_tokens_token ON email_change_tokens(token);
CREATE INDEX IF NOT EXISTS idx_email_change_tokens_user_id ON email_change_tokens(user_id);
-- Tabla para configuraciones sensibles (JWT, etc.)
CREATE TABLE IF NOT EXISTS advanced_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,                      -- Encriptado si es sensitive
    is_encrypted BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para límites de IA
CREATE TABLE IF NOT EXISTS ai_limits (
    role VARCHAR(50) PRIMARY KEY,            -- 'admin', 'user', 'guest'
    daily_token_limit INTEGER DEFAULT 10000,
    daily_request_limit INTEGER DEFAULT 100,
    enabled BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar límites por defecto
INSERT INTO ai_limits (role, daily_token_limit, daily_request_limit, enabled)
VALUES 
    ('admin', 100000, 1000, true),
    ('user', 10000, 50, true),
    ('guest', 1000, 10, true)
ON CONFLICT (role) DO NOTHING;

-- Configuración Global de IA (toggle maestro) almacenada en advanced_settings
INSERT INTO advanced_settings (setting_key, setting_value, is_encrypted)
VALUES ('ai_global_enabled', 'true', false)
ON CONFLICT (setting_key) DO NOTHING;

-- Tabla para tracking de uso de IA
CREATE TABLE IF NOT EXISTS ai_usage_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    tokens_used INTEGER NOT NULL DEFAULT 0,
    request_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_date ON ai_usage_logs(user_id, created_at);

-- Tabla para traducciones multi-idioma (JSONB)
CREATE TABLE IF NOT EXISTS translations (
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'common',
    translations JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_translations_key ON translations(key);
CREATE INDEX IF NOT EXISTS idx_translations_category ON translations(category);

-- Seed Default Translations
INSERT INTO translations (key, category, translations) VALUES
-- Common
('common.save', 'common', '{"es": "Guardar", "en": "Save", "pt": "Salvar"}'),
('common.cancel', 'common', '{"es": "Cancelar", "en": "Cancel", "pt": "Cancelar"}'),
('common.loading', 'common', '{"es": "Cargando...", "en": "Loading...", "pt": "Carregando..."}'),
('common.error', 'common', '{"es": "Error", "en": "Error", "pt": "Erro"}'),
('common.success', 'common', '{"es": "Éxito", "en": "Success", "pt": "Sucesso"}'),
-- Auth
('auth.login', 'auth', '{"es": "Iniciar Sesión", "en": "Log In", "pt": "Entrar"}'),
('auth.logout', 'auth', '{"es": "Cerrar Sesión", "en": "Log Out", "pt": "Sair"}'),
-- Settings
('settings.title', 'settings', '{"es": "Configuración de Cuenta", "en": "Account Settings", "pt": "Configurações da Conta"}'),
('settings.darkMode', 'settings', '{"es": "Modo Oscuro", "en": "Dark Mode", "pt": "Modo Escuro"}'),
('settings.language', 'settings', '{"es": "Idioma", "en": "Language", "pt": "Idioma"}'),
('settings.profile', 'settings', '{"es": "Perfil", "en": "Profile", "pt": "Perfil"}'),
('settings.security', 'settings', '{"es": "Seguridad", "en": "Security", "pt": "Segurança"}'),
('settings.preferences', 'settings', '{"es": "Preferencias", "en": "Preferences", "pt": "Preferências"}'),
('settings.info', 'settings', '{"es": "Información", "en": "Info", "pt": "Informações"}')
ON CONFLICT (key) DO UPDATE SET translations = EXCLUDED.translations;


