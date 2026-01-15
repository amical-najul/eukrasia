-- Mind Configurations Table
-- Stores per-user preferences for Trataka focus sessions

CREATE TABLE IF NOT EXISTS mind_configurations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    default_focus_object VARCHAR(20) DEFAULT 'candle',
    default_duration_sec INTEGER DEFAULT 300,
    bg_sounds BOOLEAN DEFAULT true,
    transition_sounds BOOLEAN DEFAULT true,
    micro_shift BOOLEAN DEFAULT true,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_mind_config_user ON mind_configurations(user_id);
