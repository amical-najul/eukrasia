-- Table: ai_analysis_reports
-- Description: Stores AI-generated health analysis reports for users

CREATE TABLE IF NOT EXISTS ai_analysis_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    report_type VARCHAR(20) NOT NULL, -- 'weekly', 'on-demand', 'daily', 'monthly'
    date_range_start TIMESTAMP NOT NULL,
    date_range_end TIMESTAMP NOT NULL,
    content TEXT, -- Markdown content of the analysis
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for efficient history retrieval
CREATE INDEX IF NOT EXISTS idx_ai_reports_user_date ON ai_analysis_reports(user_id, created_at DESC);
