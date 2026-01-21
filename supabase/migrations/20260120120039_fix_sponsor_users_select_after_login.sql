/*
  # Fix sponsor_users SELECT policy for login

  1. Problem
    - After successful authentication, users cannot query their own record from sponsor_users
    - Getting "permission denied for table users" error
    - This prevents login from working even after auth succeeds

  2. Solution
    - Drop the existing SELECT policy that's causing permission issues
    - Create a simple policy that allows authenticated users to read their own record by email
    - Use a straightforward email match without complex joins

  3. Security
    - Users can only read their own sponsor_users record
    - Must be authenticated
    - Matches on email which is set by Supabase Auth
*/

-- Drop existing problematic policy
DROP POLICY IF EXISTS "Users can view own sponsor record" ON sponsor_users;
DROP POLICY IF EXISTS "Authenticated users can view their own sponsor record" ON sponsor_users;
DROP POLICY IF EXISTS "Allow authenticated users to read own sponsor_users record" ON sponsor_users;

-- Create a simple, working policy for SELECT
CREATE POLICY "Authenticated users can read own record by email"
  ON sponsor_users
  FOR SELECT
  TO authenticated
  USING (email = auth.jwt() ->> 'email');
