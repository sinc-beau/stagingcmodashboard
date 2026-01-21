/*
  # Fix is_admin_or_account_manager Function

  1. Changes
    - Update is_admin_or_account_manager() function to check status = 'approved' instead of is_approved = true
    - This fixes the column not found error when querying sponsor_obligations

  2. Notes
    - The sponsor_users table uses a 'status' column with values like 'approved', not a boolean 'is_approved' column
*/

-- Drop and recreate the function with correct column reference
CREATE OR REPLACE FUNCTION is_admin_or_account_manager()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM sponsor_users
    WHERE id = auth.uid()
    AND role IN ('admin', 'account_manager')
    AND status = 'approved'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
