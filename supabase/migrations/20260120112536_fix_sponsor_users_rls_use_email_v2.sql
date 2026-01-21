/*
  # Fix Sponsor Users RLS Policies to Use Email

  1. Changes
    - Drop existing policies that check by ID
    - Recreate helper functions to use email for lookups (with CASCADE)
    - Recreate policies to check by email instead
    
  2. Security
    - Maintains same security model but uses email as the join key
    - Users can view/update their own records based on email match
    - Admins and account managers retain full access
*/

-- Drop existing policies that will be recreated
DROP POLICY IF EXISTS "Sponsors can view own record" ON sponsor_users;
DROP POLICY IF EXISTS "Sponsors can update own last_login" ON sponsor_users;

-- Drop and recreate helper functions with CASCADE (they're used by many policies)
DROP FUNCTION IF EXISTS is_admin() CASCADE;
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM sponsor_users su
    JOIN auth.users au ON su.email = au.email
    WHERE au.id = auth.uid()
    AND su.role = 'admin'
    AND su.status = 'approved'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP FUNCTION IF EXISTS get_user_sponsor_id() CASCADE;
CREATE OR REPLACE FUNCTION get_user_sponsor_id()
RETURNS uuid AS $$
DECLARE
  user_sponsor_id uuid;
BEGIN
  SELECT su.sponsor_id INTO user_sponsor_id
  FROM sponsor_users su
  JOIN auth.users au ON su.email = au.email
  WHERE au.id = auth.uid()
  AND su.status = 'approved';
  
  RETURN user_sponsor_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if is_account_manager exists and recreate it
DROP FUNCTION IF EXISTS is_account_manager() CASCADE;
CREATE OR REPLACE FUNCTION is_account_manager()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM sponsor_users su
    JOIN auth.users au ON su.email = au.email
    WHERE au.id = auth.uid()
    AND su.role = 'account_manager'
    AND su.status = 'approved'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Now recreate all the policies that were dropped by CASCADE

-- sponsor_users policies
CREATE POLICY "Admins can view all sponsor users"
  ON sponsor_users FOR SELECT TO authenticated
  USING (is_admin());

CREATE POLICY "Sponsors can view own record"
  ON sponsor_users FOR SELECT TO authenticated
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND status = 'approved'
  );

CREATE POLICY "Account managers can view all sponsor users"
  ON sponsor_users FOR SELECT TO authenticated
  USING (is_account_manager());

CREATE POLICY "Admins can update sponsor users"
  ON sponsor_users FOR UPDATE TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Sponsors can update own last_login"
  ON sponsor_users FOR UPDATE TO authenticated
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND status = 'approved'
  )
  WITH CHECK (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND status = 'approved'
  );

CREATE POLICY "Admins can delete sponsor users"
  ON sponsor_users FOR DELETE TO authenticated
  USING (is_admin());

-- user_activity_log policies
CREATE POLICY "Admins can view all activity logs"
  ON user_activity_log FOR SELECT TO authenticated
  USING (is_admin());

-- sponsor_messages policies
CREATE POLICY "Admins can view all messages"
  ON sponsor_messages FOR SELECT TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can send messages"
  ON sponsor_messages FOR INSERT TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Users can mark messages as read"
  ON sponsor_messages FOR UPDATE TO authenticated
  USING (is_admin() OR get_user_sponsor_id() = sponsor_id);

-- sponsor_published_attendees policies
CREATE POLICY "Admins can view all published attendees"
  ON sponsor_published_attendees FOR SELECT TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can insert published attendees"
  ON sponsor_published_attendees FOR INSERT TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete published attendees"
  ON sponsor_published_attendees FOR DELETE TO authenticated
  USING (is_admin());

-- sponsors policies
CREATE POLICY "Admins can view all sponsors"
  ON sponsors FOR SELECT TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can insert sponsors"
  ON sponsors FOR INSERT TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update all sponsors"
  ON sponsors FOR UPDATE TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete sponsors"
  ON sponsors FOR DELETE TO authenticated
  USING (is_admin());

-- sponsor_events policies
CREATE POLICY "Admins can view all sponsor events"
  ON sponsor_events FOR SELECT TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can insert sponsor events"
  ON sponsor_events FOR INSERT TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update sponsor events"
  ON sponsor_events FOR UPDATE TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete sponsor events"
  ON sponsor_events FOR DELETE TO authenticated
  USING (is_admin());

-- sponsor_contacts policies
CREATE POLICY "Admins can view all sponsor contacts"
  ON sponsor_contacts FOR SELECT TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can insert sponsor contacts"
  ON sponsor_contacts FOR INSERT TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update sponsor contacts"
  ON sponsor_contacts FOR UPDATE TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete sponsor contacts"
  ON sponsor_contacts FOR DELETE TO authenticated
  USING (is_admin());

-- event_intake_items policies
CREATE POLICY "Admins can view all intake items"
  ON event_intake_items FOR SELECT TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can insert intake items"
  ON event_intake_items FOR INSERT TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update intake items"
  ON event_intake_items FOR UPDATE TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete intake items"
  ON event_intake_items FOR DELETE TO authenticated
  USING (is_admin());

-- intake_item_templates policies
CREATE POLICY "Admins can view all templates"
  ON intake_item_templates FOR SELECT TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can insert templates"
  ON intake_item_templates FOR INSERT TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update templates"
  ON intake_item_templates FOR UPDATE TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete templates"
  ON intake_item_templates FOR DELETE TO authenticated
  USING (is_admin());

-- attendees policies
CREATE POLICY "Admins can view all attendees"
  ON attendees FOR SELECT TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can insert attendees"
  ON attendees FOR INSERT TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update attendees"
  ON attendees FOR UPDATE TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete attendees"
  ON attendees FOR DELETE TO authenticated
  USING (is_admin());
