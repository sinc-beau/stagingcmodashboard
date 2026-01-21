/*
  # Remove all conflicting sponsor_users RLS policies

  1. Problem
    - Multiple SELECT policies exist on sponsor_users table
    - Old policies with subqueries to auth.users are causing "permission denied for table users" error
    - Postgres evaluates ALL policies, and if any fail, the query fails

  2. Solution
    - Drop ALL existing RLS policies on sponsor_users
    - Recreate only the necessary policies with simple, working logic
    - Use auth.jwt() instead of subqueries to auth.users

  3. Security
    - Users can only read their own record
    - Admins can manage all records
    - Anyone can insert during signup (pending approval)
*/

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Authenticated users can read own record by email" ON sponsor_users;
DROP POLICY IF EXISTS "Users can view own record" ON sponsor_users;
DROP POLICY IF EXISTS "Admins can view all" ON sponsor_users;
DROP POLICY IF EXISTS "Users can update own last_login" ON sponsor_users;
DROP POLICY IF EXISTS "Anyone can insert during signup" ON sponsor_users;
DROP POLICY IF EXISTS "Admins can update any user" ON sponsor_users;
DROP POLICY IF EXISTS "Admins can delete users" ON sponsor_users;

-- Recreate clean policies
CREATE POLICY "Users can read own sponsor_users record"
  ON sponsor_users
  FOR SELECT
  TO authenticated
  USING (email = auth.jwt() ->> 'email');

CREATE POLICY "Admins can read all sponsor_users"
  ON sponsor_users
  FOR SELECT
  TO authenticated
  USING (check_is_admin());

CREATE POLICY "Anyone can insert new sponsor_users"
  ON sponsor_users
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own last_login"
  ON sponsor_users
  FOR UPDATE
  TO authenticated
  USING (email = auth.jwt() ->> 'email')
  WITH CHECK (email = auth.jwt() ->> 'email');

CREATE POLICY "Admins can update any sponsor_users"
  ON sponsor_users
  FOR UPDATE
  TO authenticated
  USING (check_is_admin())
  WITH CHECK (check_is_admin());

CREATE POLICY "Admins can delete sponsor_users"
  ON sponsor_users
  FOR DELETE
  TO authenticated
  USING (check_is_admin());
