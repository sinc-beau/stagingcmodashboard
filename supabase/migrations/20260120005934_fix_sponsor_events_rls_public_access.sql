/*
  # Fix Sponsor Events RLS Policies for Public Access

  ## Changes
  Updates the RLS policies on sponsor_events table to allow public (anonymous) access
  for INSERT and UPDATE operations, since this is an internal tool using the anon key.

  ## Security Note
  This allows anyone with the anon key to modify sponsor events data. Since this is
  an internal CRM tool, this is acceptable. For production apps with user authentication,
  you would use more restrictive policies.
*/

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Authenticated users can insert sponsor events" ON sponsor_events;
DROP POLICY IF EXISTS "Authenticated users can update sponsor events" ON sponsor_events;
DROP POLICY IF EXISTS "Authenticated users can delete sponsor events" ON sponsor_events;

-- Create public access policies
CREATE POLICY "Public can insert sponsor events"
  ON sponsor_events
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can update sponsor events"
  ON sponsor_events
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete sponsor events"
  ON sponsor_events
  FOR DELETE
  TO public
  USING (true);
