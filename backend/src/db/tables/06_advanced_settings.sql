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
