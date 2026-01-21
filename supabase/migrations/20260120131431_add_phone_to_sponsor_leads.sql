/*
  # Add Phone Field to Sponsor Leads

  1. Changes
    - Add phone field to sponsor_leads table
    - This allows syncing phone numbers from attendee data

  2. Important Notes
    - Phone is nullable as not all attendees may have this info
    - Will be populated during lead sync from events
*/

-- Add phone column to sponsor_leads
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sponsor_leads' AND column_name = 'phone'
  ) THEN
    ALTER TABLE sponsor_leads ADD COLUMN phone text;
  END IF;
END $$;