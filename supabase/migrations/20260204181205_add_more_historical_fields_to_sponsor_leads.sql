/*
  # Add Additional Historical Fields to Sponsor Leads

  1. Changes
    - Add `historical_event_type` text field (e.g., "vRT", "Dinner", "Forum")
    - Add `historical_event_city` text field for event location
    - Add `historical_event_venue` text field for venue name
    - Add `historical_status` text field for attendance status (e.g., "Attended", "Cancelled")

  2. Purpose
    - Support comprehensive historical lead data import with full event details
    - Enable filtering and display of historical leads by event type, location, and status
    - Maintain complete historical context for sponsor leads

  3. Security
    - No RLS changes needed - existing policies cover all sponsor_leads columns
*/

-- Add additional historical fields to sponsor_leads table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sponsor_leads' AND column_name = 'historical_event_type'
  ) THEN
    ALTER TABLE sponsor_leads ADD COLUMN historical_event_type text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sponsor_leads' AND column_name = 'historical_event_city'
  ) THEN
    ALTER TABLE sponsor_leads ADD COLUMN historical_event_city text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sponsor_leads' AND column_name = 'historical_event_venue'
  ) THEN
    ALTER TABLE sponsor_leads ADD COLUMN historical_event_venue text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sponsor_leads' AND column_name = 'historical_status'
  ) THEN
    ALTER TABLE sponsor_leads ADD COLUMN historical_status text;
  END IF;
END $$;

-- Create index for filtering by event type
CREATE INDEX IF NOT EXISTS idx_sponsor_leads_historical_type ON sponsor_leads(historical_event_type) WHERE is_historical = true;
