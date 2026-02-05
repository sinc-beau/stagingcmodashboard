/*
  # Remove Temporary RLS Policies for Historical Leads

  1. Changes
    - Drop temporary anon policies that were restricting historical lead visibility
    - Ensure authenticated users (sponsors, account managers, admins) can see all historical leads properly

  2. Security
    - Maintains proper RLS for authenticated sponsor users
    - Account managers and admins retain full access
*/

-- Drop the temporary restrictive policies
DROP POLICY IF EXISTS "temp_allow_read_historical_leads" ON sponsor_leads;
DROP POLICY IF EXISTS "temp_allow_forum_historical_inserts" ON sponsor_leads;
