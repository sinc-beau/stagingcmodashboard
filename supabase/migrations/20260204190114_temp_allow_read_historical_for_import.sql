/*
  # Temporary Read Policy for Import Script

  Allows reading historical leads to determine the next attendee ID
*/

CREATE POLICY "temp_allow_read_historical_leads"
  ON sponsor_leads
  FOR SELECT
  TO anon
  USING (is_historical = true AND attendee_id LIKE 'hist_rc_%');