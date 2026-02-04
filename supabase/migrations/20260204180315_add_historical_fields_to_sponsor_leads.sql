/*
  # Add Historical Fields to Sponsor Leads

  1. Changes
    - Add `is_historical` boolean field to distinguish historical vs current leads
    - Add `historical_event_name` text field for original event names
    - Add `historical_event_date` date field for event dates
    - Create index on is_historical for faster filtering
    - Set default value of false for is_historical on existing records

  2. Purpose
    - Support historical lead data import for sponsors (RingCentral, Commvault)
    - Allow display of historical leads separately from current event leads
    - Maintain backward compatibility with existing lead data

  3. Security
    - No RLS changes needed - existing policies cover historical leads
    - Historical leads are read-only for sponsors
*/

-- Add historical fields to sponsor_leads table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sponsor_leads' AND column_name = 'is_historical'
  ) THEN
    ALTER TABLE sponsor_leads ADD COLUMN is_historical boolean DEFAULT false NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sponsor_leads' AND column_name = 'historical_event_name'
  ) THEN
    ALTER TABLE sponsor_leads ADD COLUMN historical_event_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sponsor_leads' AND column_name = 'historical_event_date'
  ) THEN
    ALTER TABLE sponsor_leads ADD COLUMN historical_event_date date;
  END IF;
END $$;

-- Create index for faster historical lead filtering
CREATE INDEX IF NOT EXISTS idx_sponsor_leads_is_historical ON sponsor_leads(is_historical);

-- Create composite index for historical leads by sponsor
CREATE INDEX IF NOT EXISTS idx_sponsor_leads_historical_lookup ON sponsor_leads(sponsor_id, is_historical) WHERE is_historical = true;