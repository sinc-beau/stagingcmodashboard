/*
  # Fix sponsor_users RLS for Authenticated Users

  1. Changes
    - Add a new policy that allows authenticated users to read their own record
    - Uses auth.uid() to match against the user's email in auth.users
    - This bypasses any JWT format issues

  2. Security
    - Only authenticated users can access
    - Only their own record (matched via auth.uid() -> auth.users.email -> sponsor_users.email)
*/

-- Drop existing "Users can read own sponsor_users record" policy if it exists
DROP POLICY IF EXISTS "Users can read own sponsor_users record" ON sponsor_users;

-- Create new policy using auth.uid() lookup
CREATE POLICY "Authenticated users can read own record"
  ON sponsor_users FOR SELECT
  TO authenticated
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );
