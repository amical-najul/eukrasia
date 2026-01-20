-- Table: user_llm_config
-- Description: Stores user-specific LLM API key configuration (encrypted) for AI Analysis

CREATE TABLE IF NOT EXISTS user_llm_config (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL, -- 'openai', 'anthropic', 'gemini', 'deepseek', 'xai'
    api_key TEXT NOT NULL,         -- Encrypted with encryption utility
    model VARCHAR(100),            -- Optional model preference
    analysis_frequency VARCHAR(20) DEFAULT 'weekly', -- 'daily', 'weekly', 'monthly', 'manual_only'
    last_analysis_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_llm_config_user_id ON user_llm_config(user_id);
