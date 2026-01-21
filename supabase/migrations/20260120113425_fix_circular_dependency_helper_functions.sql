/*
  # Fix circular dependency in is_admin and is_account_manager functions
  
  1. Changes
    - Replace is_admin() to use user_status table instead of sponsor_users
    - Replace is_account_manager() to use user_status table instead of sponsor_users
    
  2. Purpose
    - Avoid circular dependency when sponsor_users policies call these functions
    - The user_status table has simpler RLS (anyone can read) so no circular issues
*/

-- Replace is_admin function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_status
    WHERE user_id = auth.uid()
    AND role = 'admin'
    AND status = 'approved'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Replace is_account_manager function
CREATE OR REPLACE FUNCTION is_account_manager()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_status
    WHERE user_id = auth.uid()
    AND role = 'account_manager'
    AND status = 'approved'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
