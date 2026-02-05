/*
  # Remove temporary import policy

  1. Security Changes
    - Remove temporary anon insert policy used for import
*/

-- Drop the temporary import policy
DROP POLICY IF EXISTS "temp_allow_insert_for_import_anon" ON historical_attendees;
