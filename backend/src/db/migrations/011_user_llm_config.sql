CREATE TABLE IF NOT EXISTS user_llm_config (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL, -- 'openai', 'anthropic', etc.
    api_key TEXT NOT NULL,         -- Encrypted
    model VARCHAR(100),            -- Optional model preference
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_llm_config_user_id ON user_llm_config(user_id);
