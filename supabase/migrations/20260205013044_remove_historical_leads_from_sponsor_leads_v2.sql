/*
  # Remove historical leads from sponsor_leads

  1. Changes
    - Remove temporary RLS policies for historical leads
    - Delete all records where is_historical = true
    - Drop historical-related columns
    - Remove the check constraint added earlier
    - Re-add NOT NULL constraint on event_id

  2. Notes
    - All historical data now lives in historical_attendees table
*/

-- Remove the temporary RLS policies first
DROP POLICY IF EXISTS "Allow historical lead inserts" ON sponsor_leads;
DROP POLICY IF EXISTS "Temp allow read historical for import" ON sponsor_leads;

-- Delete all historical leads
DELETE FROM sponsor_leads WHERE is_historical = true;

-- Drop the check constraint
ALTER TABLE sponsor_leads
DROP CONSTRAINT IF EXISTS sponsor_leads_event_id_required_check;

-- Make event_id NOT NULL again
ALTER TABLE sponsor_leads
ALTER COLUMN event_id SET NOT NULL;

-- Drop historical-related columns
ALTER TABLE sponsor_leads
DROP COLUMN IF EXISTS is_historical CASCADE,
DROP COLUMN IF EXISTS historical_event_name CASCADE,
DROP COLUMN IF EXISTS historical_event_type CASCADE,
DROP COLUMN IF EXISTS historical_event_date CASCADE;
