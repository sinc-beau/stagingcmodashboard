/*
  # Update sponsor_events RLS policies to allow account managers

  1. Changes
    - Add policy to allow admins and account managers to update sponsor_events
    - This enables account managers to assign obligations to events

  2. Security
    - Only admins and account managers can update events
    - Uses existing is_admin_or_account_manager() function for verification
*/

-- Drop existing admin-only update policy
DROP POLICY IF EXISTS "Admins can update events" ON sponsor_events;

-- Create new policy allowing both admins and account managers to update
CREATE POLICY "Admins and account managers can update events"
  ON sponsor_events FOR UPDATE TO authenticated
  USING (is_admin_or_account_manager())
  WITH CHECK (is_admin_or_account_manager());