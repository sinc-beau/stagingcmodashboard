/*
  # Fix Sponsor Events Visibility

  1. Changes
    - Remove old restrictive policy that requires is_published = true
    - Keep the policy that allows sponsors to view all their own events
    - This allows sponsors to see their events immediately after sync

  2. Security
    - Sponsors can still only view events associated with their sponsor_id
    - Admins and account managers maintain full access
*/

-- Drop the old restrictive policy that requires is_published = true
DROP POLICY IF EXISTS "Sponsors can view own published events only" ON sponsor_events;

-- The policy "Sponsors can view own events" already exists and allows access without requiring is_published
-- No additional policies needed
