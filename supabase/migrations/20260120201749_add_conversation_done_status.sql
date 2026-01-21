/*
  # Add conversation done status

  1. Changes
    - Add `conversation_done` field to `sponsors` table to track if admin marked conversation as complete
    - Add `conversation_done_at` timestamp to track when it was marked done
    - Add `conversation_done_by` to track which admin/manager marked it done
  
  2. Security
    - No RLS changes needed
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sponsors' AND column_name = 'conversation_done'
  ) THEN
    ALTER TABLE sponsors ADD COLUMN conversation_done boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sponsors' AND column_name = 'conversation_done_at'
  ) THEN
    ALTER TABLE sponsors ADD COLUMN conversation_done_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sponsors' AND column_name = 'conversation_done_by'
  ) THEN
    ALTER TABLE sponsors ADD COLUMN conversation_done_by uuid REFERENCES sponsor_users(id);
  END IF;
END $$;