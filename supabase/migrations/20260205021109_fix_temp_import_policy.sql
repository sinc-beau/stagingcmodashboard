/*
  # Fix temporary import policy

  1. Security Changes
    - Drop previous temp policy
    - Add new policy that works with anon key for import
*/

-- Drop the previous temp policy
DROP POLICY IF EXISTS "temp_allow_insert_for_import" ON historical_attendees;

-- Create policy that allows anon inserts temporarily
CREATE POLICY "temp_allow_insert_for_import_anon"
  ON historical_attendees
  FOR INSERT
  TO anon
  WITH CHECK (true);
