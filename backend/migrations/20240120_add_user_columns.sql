-- Add missing columns for email verification and password reset on Supabase Postgres
-- Safe guards use conditional checks so it can be run multiple times.

DO $$
BEGIN
    -- verification_token
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'verification_token'
    ) THEN
        ALTER TABLE public.users
        ADD COLUMN verification_token text;
    END IF;

    -- is_verified
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'is_verified'
    ) THEN
        ALTER TABLE public.users
        ADD COLUMN is_verified boolean DEFAULT false;
    END IF;

    -- role
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'role'
    ) THEN
        ALTER TABLE public.users
        ADD COLUMN role text DEFAULT 'user';
    END IF;

    -- reset token + expiry
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'reset_token'
    ) THEN
        ALTER TABLE public.users
        ADD COLUMN reset_token text;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'reset_token_expires'
    ) THEN
        ALTER TABLE public.users
        ADD COLUMN reset_token_expires timestamptz;
    END IF;
END $$;
