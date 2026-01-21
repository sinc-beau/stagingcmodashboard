/*
  # Fix sponsor_users SELECT policy - allow all roles

  1. Changes
    - Drop existing SELECT policy
    - Create new policy that allows both authenticated and anon users to SELECT
    - This ensures login checks work immediately after authentication

  2. Security
    - Read-only access to sponsor_users table
    - Application handles authorization logic based on status/role
*/

-- Drop existing policy
DROP POLICY IF EXISTS "Authenticated users can read sponsor_users" ON sponsor_users;

-- Allow both authenticated and anonymous users to read sponsor_users
CREATE POLICY "Allow all to read sponsor_users"
  ON sponsor_users FOR SELECT
  USING (true);
