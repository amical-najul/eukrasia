-- =============================================
-- TABLA: email_templates
-- Descripción: Plantillas personalizables para emails de autenticación
-- =============================================

CREATE TABLE IF NOT EXISTS email_templates (
    id SERIAL PRIMARY KEY,
    template_key VARCHAR(50) UNIQUE NOT NULL,  -- 'email_verification', 'password_reset', 'email_change'
    sender_name VARCHAR(255),
    sender_email VARCHAR(255),
    reply_to VARCHAR(255),
    subject VARCHAR(500) NOT NULL,
    body_html TEXT NOT NULL,
    body_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índice para búsqueda rápida por clave
CREATE INDEX IF NOT EXISTS idx_email_templates_key ON email_templates(template_key);
