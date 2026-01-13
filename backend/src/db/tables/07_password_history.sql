-- Tabla para historial de contraseñas
CREATE TABLE IF NOT EXISTS password_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índice para búsquedas rápidas (validación de últimas N contraseñas)
CREATE INDEX IF NOT EXISTS idx_password_history_user_date 
ON password_history(user_id, created_at DESC);
