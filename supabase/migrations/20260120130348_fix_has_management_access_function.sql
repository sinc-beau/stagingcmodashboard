/*
  # Fix has_management_access Function

  1. Changes
    - Update has_management_access() to use email matching instead of id matching
    - This aligns with check_is_admin() pattern
    - Fixes admin and account manager access to attendee data

  2. Important Notes
    - The sponsor_users.id is NOT the same as auth.users.id
    - We must match by email for proper authentication
*/

-- Drop and recreate the function with correct logic
CREATE OR REPLACE FUNCTION has_management_access() 
RETURNS boolean 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
DECLARE
  user_email text;
  has_access boolean;
BEGIN
  -- Get the email of the current user
  SELECT email INTO user_email FROM auth.users WHERE id = auth.uid();
  
  IF user_email IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if user has management access (bypasses RLS)
  SELECT EXISTS (
    SELECT 1 FROM sponsor_users
    WHERE email = user_email
    AND role IN ('admin', 'account_manager')
    AND status = 'approved'
  ) INTO has_access;
  
  RETURN has_access;
END;
$$;