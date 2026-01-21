/*
  # Fix Signup: Remove user_status Trigger and Add Name Field

  1. Changes
    - Drop the sync_user_status trigger that references deleted user_status table
    - Drop the sync_user_status function
    - Add 'name' column to sponsor_users table for full name during signup

  2. New Columns
    - `name` (text, not null) - Full name of the person signing up

  3. Notes
    - The user_status table was dropped in a previous migration but the trigger remained
    - This fixes the "relation user_status does not exist" error during signup
*/

-- Drop the trigger first
DROP TRIGGER IF EXISTS sync_user_status_trigger ON sponsor_users;

-- Drop the function
DROP FUNCTION IF EXISTS sync_user_status();

-- Add name column to sponsor_users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sponsor_users' AND column_name = 'name'
  ) THEN
    ALTER TABLE sponsor_users ADD COLUMN name text NOT NULL DEFAULT '';
  END IF;
END $$;

-- Update the default to allow empty strings temporarily (for existing records)
ALTER TABLE sponsor_users ALTER COLUMN name DROP DEFAULT;