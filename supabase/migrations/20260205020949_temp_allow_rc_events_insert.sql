/*
  # Temporarily allow RC events import

  1. Security Changes
    - Add temporary insert policy for historical_attendees to allow import script
    - This will be removed after import is complete
*/

-- Temporarily allow inserts for import
CREATE POLICY "temp_allow_insert_for_import"
  ON historical_attendees
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
