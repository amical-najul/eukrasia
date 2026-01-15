-- Mind Sessions Table (Trataka Focus)
-- Stores user meditation/focus sessions

CREATE TABLE IF NOT EXISTS mind_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    target_duration_sec INTEGER NOT NULL,
    actual_duration_sec INTEGER NOT NULL,
    distraction_count INTEGER DEFAULT 0,
    focus_object VARCHAR(20) NOT NULL,  -- 'candle', 'moon', 'yantra', 'dot'
    status VARCHAR(20) NOT NULL,        -- 'completed', 'partial'
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_mind_sessions_user ON mind_sessions(user_id, created_at);
