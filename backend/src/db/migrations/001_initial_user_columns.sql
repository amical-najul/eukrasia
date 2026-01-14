-- Migration: Initial Column Setup
-- This consolidates the ensureColumn logic from server.js into a proper migration.
-- These columns should already exist if app has been running; this is for safety.

-- Note: Using DO blocks with exception handling for idempotent column additions

DO $$
BEGIN
    -- Add 'name' column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='name') THEN
        ALTER TABLE users ADD COLUMN name VARCHAR(255);
    END IF;

    -- Add 'avatar_url' column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='avatar_url') THEN
        ALTER TABLE users ADD COLUMN avatar_url TEXT;
    END IF;

    -- Add 'active' column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='active') THEN
        ALTER TABLE users ADD COLUMN active BOOLEAN DEFAULT TRUE;
    END IF;

    -- Add 'role' column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='role') THEN
        ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'user';
    END IF;

    -- Add 'status' column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='status') THEN
        ALTER TABLE users ADD COLUMN status VARCHAR(20) DEFAULT 'active';
    END IF;

    -- Add 'language_preference' column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='language_preference') THEN
        ALTER TABLE users ADD COLUMN language_preference VARCHAR(5) DEFAULT 'es';
    END IF;
END $$;
