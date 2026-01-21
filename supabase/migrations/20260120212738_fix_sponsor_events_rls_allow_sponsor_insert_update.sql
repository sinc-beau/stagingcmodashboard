/*
  # Fix sponsor_events RLS to allow sponsors to manage their own events
  
  ## Issue Identified
  Sponsors can SELECT their own events but cannot INSERT or UPDATE them.
  When EventDetail tries to create/update sponsor_events records, the operations
  fail silently due to missing RLS policies.
  
  ## Changes
  1. Add INSERT policy for sponsors to create their own sponsor_events records
  2. Add UPDATE policy for sponsors to update their own sponsor_events records
  
  ## Security
  - Sponsors can only insert/update records where sponsor_id matches their own
  - All other restrictions remain in place
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Sponsors can insert own events" ON sponsor_events;
DROP POLICY IF EXISTS "Sponsors can update own events" ON sponsor_events;

-- Allow sponsors to insert their own sponsor_events
CREATE POLICY "Sponsors can insert own events"
  ON sponsor_events
  FOR INSERT
  TO authenticated
  WITH CHECK (sponsor_id = get_user_sponsor_id());

-- Allow sponsors to update their own sponsor_events
CREATE POLICY "Sponsors can update own events"
  ON sponsor_events
  FOR UPDATE
  TO authenticated
  USING (sponsor_id = get_user_sponsor_id())
  WITH CHECK (sponsor_id = get_user_sponsor_id());
