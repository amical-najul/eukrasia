CREATE TABLE IF NOT EXISTS breathing_configurations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    rounds INTEGER DEFAULT 3,
    breaths_per_round INTEGER DEFAULT 30,
    speed VARCHAR(20) DEFAULT 'standard',
    bg_music BOOLEAN DEFAULT TRUE,
    phase_music BOOLEAN DEFAULT TRUE,
    retention_music BOOLEAN DEFAULT TRUE,
    voice_guide BOOLEAN DEFAULT TRUE,
    breathing_guide BOOLEAN DEFAULT TRUE,
    retention_guide BOOLEAN DEFAULT TRUE,
    ping_gong BOOLEAN DEFAULT TRUE,
    breath_sounds BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_breathing_config_user_id ON breathing_configurations(user_id);
