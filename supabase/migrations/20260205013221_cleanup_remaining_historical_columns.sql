/*
  # Cleanup remaining historical columns

  1. Changes
    - Drop remaining historical columns from sponsor_leads
    - These were missed in the previous migration

  2. Notes
    - All historical data is now in historical_attendees table
*/

-- Drop remaining historical columns
ALTER TABLE sponsor_leads
DROP COLUMN IF EXISTS historical_event_city CASCADE,
DROP COLUMN IF EXISTS historical_event_venue CASCADE,
DROP COLUMN IF EXISTS historical_status CASCADE;
