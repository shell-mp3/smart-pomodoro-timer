-- Profiles
-- Run this AFTER schema.sql in the Supabase SQL Editor.
--
-- Supabase keeps identity in auth.users, which your app cannot query directly.
-- This mirrors the public-facing parts into a table you can read, and seeds it
-- from whatever the identity provider gave us (Google supplies name + picture).

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- A profile is readable and writable only by the person it belongs to.
CREATE POLICY "Users can view their own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can delete their own profile"
    ON profiles FOR DELETE
    USING (auth.uid() = id);

-- Create the profile automatically the moment someone signs up, so the app
-- never has to handle a signed-in user with no profile row.
--
-- SECURITY DEFINER is required: this runs during signup, before there is an
-- authenticated session for the row-level policies to match against.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name, avatar_url)
    VALUES (
        NEW.id,
        -- Google sends 'full_name' / 'name'; email signups have neither, so
        -- fall back to the part of the address before the @
        COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'name',
            split_part(NEW.email, '@', 1)
        ),
        COALESCE(
            NEW.raw_user_meta_data->>'avatar_url',
            NEW.raw_user_meta_data->>'picture'
        )
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill anyone who signed up before this migration ran
INSERT INTO public.profiles (id, display_name, avatar_url)
SELECT
    u.id,
    COALESCE(
        u.raw_user_meta_data->>'full_name',
        u.raw_user_meta_data->>'name',
        split_part(u.email, '@', 1)
    ),
    COALESCE(
        u.raw_user_meta_data->>'avatar_url',
        u.raw_user_meta_data->>'picture'
    )
FROM auth.users u
ON CONFLICT (id) DO NOTHING;
