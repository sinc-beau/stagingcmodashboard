/*
  # Fix is_admin_or_account_manager to Match by Email

  1. Changes
    - Update is_admin_or_account_manager() function to match by email instead of ID
    - This fixes the authentication mismatch where auth.uid() doesn't match sponsor_users.id

  2. Notes
    - sponsor_users.id is a separate UUID from auth.users.id
    - We need to match by email to properly identify the user
*/

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
