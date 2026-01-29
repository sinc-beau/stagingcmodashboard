/*
  # Add obligation_id back to sponsor_events

  1. Changes
    - Add `obligation_id` column to `sponsor_events` table
    - Add foreign key constraint to `sponsor_obligations`
    - Create index for faster lookups

  2. Notes
    - This column was lost during the events table restructure
    - Events can optionally be assigned to a specific obligation
    - Multiple events can be assigned to the same obligation
*/

-- Add obligation_id column to sponsor_events
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sponsor_events' AND column_name = 'obligation_id'
  ) THEN
    ALTER TABLE sponsor_events ADD COLUMN obligation_id uuid REFERENCES sponsor_obligations(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS sponsor_events_obligation_id_idx ON sponsor_events(obligation_id);
