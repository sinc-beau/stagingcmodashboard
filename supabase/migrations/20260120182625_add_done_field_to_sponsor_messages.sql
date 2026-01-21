/*
  # Add done field to sponsor_messages

  1. Changes
    - Add `done` boolean column to `sponsor_messages` table with default value false
    - This allows admins/managers to mark messages as completed/resolved
  
  2. Security
    - No changes to RLS policies needed
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sponsor_messages' AND column_name = 'done'
  ) THEN
    ALTER TABLE sponsor_messages ADD COLUMN done boolean DEFAULT false;
  END IF;
END $$;
