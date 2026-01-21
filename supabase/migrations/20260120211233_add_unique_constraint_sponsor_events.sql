/*
  # Add unique constraint to sponsor_events

  1. Changes
    - Add unique constraint on (sponsor_id, source_event_id, source_database)
    - This prevents duplicate event records for the same sponsor

  2. Security
    - No RLS changes needed
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'sponsor_events_unique_event'
  ) THEN
    ALTER TABLE sponsor_events
    ADD CONSTRAINT sponsor_events_unique_event
    UNIQUE (sponsor_id, source_event_id, source_database);
  END IF;
END $$;
