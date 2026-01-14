CREATE TABLE IF NOT EXISTS breathing_exercises (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    duration_seconds INTEGER NOT NULL,
    rounds_data JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_breathing_user_date ON breathing_exercises(user_id, created_at);
