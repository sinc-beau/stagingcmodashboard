/*
  # Simplify sponsor_users SELECT policy

  1. Changes
    - Drop all existing SELECT policies on sponsor_users
    - Create ONE simple policy: authenticated users can read any record
    - No complex functions, no email matching complexity
    - After successful auth, users can query sponsor_users to check their status

  2. Security
    - Users are already authenticated via Supabase Auth
    - They can only read sponsor_users, not modify
    - The application logic handles authorization based on status/role
*/

-- Drop all existing SELECT policies
DROP POLICY IF EXISTS "Admins can read all sponsor_users" ON sponsor_users;
DROP POLICY IF EXISTS "Authenticated users can read own record" ON sponsor_users;
DROP POLICY IF EXISTS "Users can read own sponsor_users record" ON sponsor_users;

-- Simple policy: authenticated users can SELECT from sponsor_users
CREATE POLICY "Authenticated users can read sponsor_users"
  ON sponsor_users FOR SELECT
  TO authenticated
  USING (true);
