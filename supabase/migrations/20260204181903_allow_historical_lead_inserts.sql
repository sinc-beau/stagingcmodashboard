/*
  # Allow Historical Lead Inserts

  1. Changes
    - Add temporary permissive policy to allow inserting historical leads
    - This enables bulk import of historical data for sponsors

  2. Security
    - Policy is restrictive: only allows inserts where is_historical = true
    - Will be used during data migration only
*/

-- Add policy to allow inserting historical leads
CREATE POLICY "Allow historical lead inserts" ON sponsor_leads
  FOR INSERT
  TO authenticated
  WITH CHECK (is_historical = true);
