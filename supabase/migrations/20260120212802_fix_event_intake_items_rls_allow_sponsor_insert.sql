/*
  # Fix event_intake_items RLS to allow sponsors to insert their own items
  
  ## Issue Identified
  Sponsors can SELECT and UPDATE their own intake items but cannot INSERT them.
  When EventDetail tries to create intake items from templates, the INSERT
  operation fails silently due to missing RLS policy.
  
  ## Changes
  Add INSERT policy for sponsors to create their own event_intake_items records
  
  ## Security
  - Sponsors can only insert records where sponsor_id matches their own
  - All other restrictions remain in place
*/

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Sponsors can insert own intake items" ON event_intake_items;

-- Allow sponsors to insert their own event_intake_items
CREATE POLICY "Sponsors can insert own intake items"
  ON event_intake_items
  FOR INSERT
  TO authenticated
  WITH CHECK (sponsor_id = get_user_sponsor_id());
