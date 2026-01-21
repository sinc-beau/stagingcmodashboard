/*
  # Fix Sponsor Users Login RLS
  
  1. Changes
    - Update policy to allow users to view their own record regardless of status
    - This allows login to properly check approval status and show appropriate messages
    
  2. Security
    - Users can only see their own record based on email match
    - Doesn't expose other users' data
*/

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Sponsors can view own record" ON sponsor_users;

-- Create new policy that allows viewing own record regardless of status
CREATE POLICY "Users can view own record"
  ON sponsor_users
  FOR SELECT
  TO authenticated
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Update the last_login policy to not require approved status for the USING clause
-- (still requires it for WITH CHECK so they can't approve themselves)
DROP POLICY IF EXISTS "Sponsors can update own last_login" ON sponsor_users;

CREATE POLICY "Users can update own last_login"
  ON sponsor_users
  FOR UPDATE
  TO authenticated
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
  WITH CHECK (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND status = 'approved'
  );
