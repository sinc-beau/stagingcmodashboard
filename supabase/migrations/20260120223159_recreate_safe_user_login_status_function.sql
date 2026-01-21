/*
  # Recreate Safe User Login Status Function

  1. Changes
    - Drop existing get_user_login_status function
    - Create new SECURITY DEFINER version
      - Returns only status and role for a given email
      - Read-only (SELECT only)
      - Used to allow unauthenticated users to check login eligibility
      - Returns minimal data with LIMIT 1 for safety

  2. Security
    - Function is SECURITY DEFINER (bypasses RLS)
    - Only performs SELECT operations
    - Only returns status and role fields
    - Parameterized to prevent SQL injection
    - Limited to single row result
*/

DROP FUNCTION IF EXISTS public.get_user_login_status(text);

CREATE OR REPLACE FUNCTION public.get_user_login_status(user_email text)
RETURNS TABLE(status text, role text) AS $$
BEGIN
  RETURN QUERY
  SELECT su.status, su.role
  FROM sponsor_users su
  WHERE su.email = user_email
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
