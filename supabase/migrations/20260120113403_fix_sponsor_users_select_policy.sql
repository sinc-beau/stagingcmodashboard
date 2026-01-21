/*
  # Fix sponsor_users SELECT policy for authenticated users
  
  1. Changes
    - Drop existing "Users can view own record" policy
    - Create new policy that explicitly allows authenticated users to read their own record
    - Ensures the email comparison works correctly
    
  2. Purpose
    - Fix the "Account Not Found" issue where authenticated users cannot load their sponsor_users record
*/

-- Drop the existing policy
DROP POLICY IF EXISTS "Users can view own record" ON sponsor_users;

-- Create a clearer policy for users viewing their own record
CREATE POLICY "Authenticated users can view own record"
  ON sponsor_users
  FOR SELECT
  TO authenticated
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );
