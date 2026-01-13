CREATE TABLE IF NOT EXISTS avatar_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    avatar_url TEXT NOT NULL,
    is_original BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_avatar_history_user ON avatar_history(user_id, created_at DESC);

-- Migracion: Guardar avatar actual como 'Original' si existe
INSERT INTO avatar_history (user_id, avatar_url, is_original)
SELECT id, avatar_url, TRUE
FROM users
WHERE avatar_url IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM avatar_history WHERE user_id = users.id);
