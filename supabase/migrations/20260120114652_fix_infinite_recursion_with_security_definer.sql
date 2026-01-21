/*
  # Fix infinite recursion with SECURITY DEFINER helper
  
  1. Changes
    - Create a SECURITY DEFINER function to check admin status (bypasses RLS)
    - Update policies to avoid circular dependencies
    
  2. Approach
    - The helper function runs with elevated privileges and bypasses RLS
    - This breaks the circular dependency chain
*/

-- Drop old policies
DROP POLICY IF EXISTS "Users can view own record" ON sponsor_users;
DROP POLICY IF EXISTS "Admins can view all users" ON sponsor_users;

-- Create helper function that bypasses RLS
CREATE OR REPLACE FUNCTION check_is_admin()
RETURNS boolean AS $$
DECLARE
  user_email text;
  is_admin_user boolean;
BEGIN
  -- Get the email of the current user
  SELECT email INTO user_email FROM auth.users WHERE id = auth.uid();
  
  IF user_email IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if user is admin (bypasses RLS)
  SELECT EXISTS (
    SELECT 1 FROM sponsor_users
    WHERE email = user_email
    AND role = 'admin'
    AND status = 'approved'
  ) INTO is_admin_user;
  
  RETURN is_admin_user;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Now create non-circular policies
-- Policy 1: Users can always view their own record
CREATE POLICY "Users can view own record"
  ON sponsor_users
  FOR SELECT
  TO authenticated
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Policy 2: Admins can view all records (uses SECURITY DEFINER function)
CREATE POLICY "Admins can view all"
  ON sponsor_users
  FOR SELECT
  TO authenticated
  USING (check_is_admin());
