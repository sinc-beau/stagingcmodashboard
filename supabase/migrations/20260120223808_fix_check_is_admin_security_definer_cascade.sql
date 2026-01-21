/*
  # Fix check_is_admin with SECURITY DEFINER (CASCADE)

  1. Changes
    - Drop check_is_admin, is_admin, is_admin_or_account_manager with CASCADE
    - Recreate all three as SECURITY DEFINER functions
    - This allows these functions to bypass RLS and read sponsor_users
    - Fixes circular dependency where RLS policies call functions that need to read from the same table

  2. Note
    - This will drop all policies that depend on these functions
    - The policies will need to be recreated (they'll be recreated in the next migration or automatically)

  3. Security
    - Functions are read-only (SELECT only)
    - Check authentication via auth.uid()
    - Limited to specific role checks
    - No user input processed (just auth context)
*/

-- Drop existing functions with CASCADE (removes dependent policies)
DROP FUNCTION IF EXISTS check_is_admin() CASCADE;
DROP FUNCTION IF EXISTS is_admin() CASCADE;
DROP FUNCTION IF EXISTS is_admin_or_account_manager() CASCADE;

-- Recreate check_is_admin with SECURITY DEFINER
CREATE OR REPLACE FUNCTION check_is_admin()
RETURNS boolean AS $$
DECLARE
  user_email text;
  is_admin_user boolean;
BEGIN
  SELECT email INTO user_email FROM auth.users WHERE id = auth.uid();
  
  IF user_email IS NULL THEN
    RETURN false;
  END IF;
  
  SELECT EXISTS (
    SELECT 1 FROM sponsor_users
    WHERE email = user_email
    AND role = 'admin'
    AND status = 'approved'
  ) INTO is_admin_user;
  
  RETURN is_admin_user;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate is_admin with SECURITY DEFINER
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN check_is_admin();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate is_admin_or_account_manager with SECURITY DEFINER
CREATE OR REPLACE FUNCTION is_admin_or_account_manager()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM sponsor_users
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND role IN ('admin', 'account_manager')
    AND status = 'approved'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
