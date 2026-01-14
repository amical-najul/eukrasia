-- Migration: Add notes column to breathing_exercises
ALTER TABLE breathing_exercises ADD COLUMN IF NOT EXISTS notes TEXT;
