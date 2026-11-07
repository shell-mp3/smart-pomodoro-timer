-- Pomodoro Timer Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Settings Table
CREATE TABLE user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    work_duration INTEGER DEFAULT 25 NOT NULL CHECK (work_duration >= 5 AND work_duration <= 60),
    short_break INTEGER DEFAULT 5 NOT NULL CHECK (short_break >= 1 AND short_break <= 15),
    long_break INTEGER DEFAULT 15 NOT NULL CHECK (long_break >= 5 AND long_break <= 30),
    sensitivity_level TEXT DEFAULT 'medium' NOT NULL CHECK (sensitivity_level IN ('low', 'medium', 'high')),
    sound_enabled BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Sessions Table
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    started_at TIMESTAMPTZ NOT NULL,
    ended_at TIMESTAMPTZ,
    planned_duration INTEGER NOT NULL, -- in seconds
    focused_duration INTEGER DEFAULT 0 NOT NULL, -- in seconds
    distraction_count INTEGER DEFAULT 0 NOT NULL,
    completed BOOLEAN DEFAULT false NOT NULL,
    break_duration INTEGER DEFAULT 0, -- in seconds
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Distraction Events Table
CREATE TABLE distraction_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    reason TEXT NOT NULL CHECK (reason IN ('no_face', 'phone_detected', 'eyes_closed', 'head_turned'))
);

-- Indexes for better query performance
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_started_at ON sessions(started_at);
CREATE INDEX idx_sessions_user_started ON sessions(user_id, started_at DESC);
CREATE INDEX idx_distraction_events_session_id ON distraction_events(session_id);
CREATE INDEX idx_distraction_events_user_id ON distraction_events(user_id);

-- Enable Row Level Security
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE distraction_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_settings
CREATE POLICY "Users can view their own settings"
    ON user_settings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
    ON user_settings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
    ON user_settings FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own settings"
    ON user_settings FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for sessions
CREATE POLICY "Users can view their own sessions"
    ON sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions"
    ON sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
    ON sessions FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions"
    ON sessions FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for distraction_events
CREATE POLICY "Users can view their own distraction events"
    ON distraction_events FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own distraction events"
    ON distraction_events FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own distraction events"
    ON distraction_events FOR DELETE
    USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for user_settings updated_at
CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to create default settings for new users
CREATE OR REPLACE FUNCTION create_default_settings()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_settings (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Trigger to create default settings on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_default_settings();
