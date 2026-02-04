/*
  # Temporary Policy for Forum Attendees Import

  Creates a temporary permissive policy to allow historical lead inserts
  This will be removed after the import is complete
*/

CREATE POLICY "temp_allow_forum_historical_inserts" 
  ON sponsor_leads
  FOR INSERT
  TO anon
  WITH CHECK (is_historical = true);