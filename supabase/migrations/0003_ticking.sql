-- Ticking sound preference
-- Run this in the Supabase SQL Editor after 0002_profiles.sql.

ALTER TABLE user_settings
    ADD COLUMN IF NOT EXISTS ticking_enabled BOOLEAN DEFAULT false NOT NULL;
