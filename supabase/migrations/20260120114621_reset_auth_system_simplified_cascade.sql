/*
  # Reset and Simplify Auth System (with CASCADE)
  
  1. Changes
    - Drop complex helper functions with CASCADE
    - Drop user_status table
    - Simplify sponsor_users table to be the single source of truth
    - Create simple, non-circular RLS policies for ALL tables
    
  2. Security
    - Simple RLS: authenticated users can read their own record
    - Admins checked by direct query (no helper functions)
*/

-- Drop helper functions with CASCADE (removes all dependent policies)
DROP FUNCTION IF EXISTS is_admin() CASCADE;
DROP FUNCTION IF EXISTS is_account_manager() CASCADE;

-- Drop user_status table
DROP TABLE IF EXISTS user_status CASCADE;

-- Clean RLS on sponsor_users
ALTER TABLE sponsor_users DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can sign up as pending" ON sponsor_users;
DROP POLICY IF EXISTS "Users can update own last_login" ON sponsor_users;
DROP POLICY IF EXISTS "Admins can view all sponsor users" ON sponsor_users;
DROP POLICY IF EXISTS "Account managers can view all sponsor users" ON sponsor_users;
DROP POLICY IF EXISTS "Authenticated users can view own record" ON sponsor_users;
DROP POLICY IF EXISTS "Admins can update sponsor users" ON sponsor_users;
DROP POLICY IF EXISTS "Admins can delete sponsor users" ON sponsor_users;

ALTER TABLE sponsor_users ENABLE ROW LEVEL SECURITY;

-- Simplified sponsor_users policies
CREATE POLICY "Anyone can insert during signup"
  ON sponsor_users
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view own record"
  ON sponsor_users
  FOR SELECT
  TO authenticated
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "Admins can view all users"
  ON sponsor_users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sponsor_users su
      WHERE su.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND su.role = 'admin'
      AND su.status = 'approved'
    )
  );

CREATE POLICY "Users can update own last_login"
  ON sponsor_users
  FOR UPDATE
  TO authenticated
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()))
  WITH CHECK (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Admins can update any user"
  ON sponsor_users
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sponsor_users su
      WHERE su.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND su.role = 'admin'
      AND su.status = 'approved'
    )
  );

CREATE POLICY "Admins can delete users"
  ON sponsor_users
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sponsor_users su
      WHERE su.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND su.role = 'admin'
      AND su.status = 'approved'
    )
  );

-- Recreate policies for other tables
-- sponsors table
CREATE POLICY "Admins can view all sponsors"
  ON sponsors
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sponsor_users
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND role = 'admin'
      AND status = 'approved'
    )
  );

CREATE POLICY "Admins can insert sponsors"
  ON sponsors
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sponsor_users
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND role = 'admin'
      AND status = 'approved'
    )
  );

CREATE POLICY "Admins can update sponsors"
  ON sponsors
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sponsor_users
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND role = 'admin'
      AND status = 'approved'
    )
  );

CREATE POLICY "Admins can delete sponsors"
  ON sponsors
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sponsor_users
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND role = 'admin'
      AND status = 'approved'
    )
  );

-- sponsor_events table
CREATE POLICY "Public can view published events"
  ON sponsor_events
  FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

CREATE POLICY "Admins can view all events"
  ON sponsor_events
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sponsor_users
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND role = 'admin'
      AND status = 'approved'
    )
  );

CREATE POLICY "Admins can insert events"
  ON sponsor_events
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sponsor_users
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND role = 'admin'
      AND status = 'approved'
    )
  );

CREATE POLICY "Admins can update events"
  ON sponsor_events
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sponsor_users
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND role = 'admin'
      AND status = 'approved'
    )
  );

CREATE POLICY "Admins can delete events"
  ON sponsor_events
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sponsor_users
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND role = 'admin'
      AND status = 'approved'
    )
  );

-- sponsor_contacts table
CREATE POLICY "Admins can view all contacts"
  ON sponsor_contacts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sponsor_users
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND role = 'admin'
      AND status = 'approved'
    )
  );

CREATE POLICY "Admins can insert contacts"
  ON sponsor_contacts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sponsor_users
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND role = 'admin'
      AND status = 'approved'
    )
  );

CREATE POLICY "Admins can update contacts"
  ON sponsor_contacts
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sponsor_users
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND role = 'admin'
      AND status = 'approved'
    )
  );

CREATE POLICY "Admins can delete contacts"
  ON sponsor_contacts
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sponsor_users
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND role = 'admin'
      AND status = 'approved'
    )
  );

-- sponsor_messages table
CREATE POLICY "Admins can view all messages"
  ON sponsor_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sponsor_users
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND role = 'admin'
      AND status = 'approved'
    )
  );

CREATE POLICY "Admins can send messages"
  ON sponsor_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sponsor_users
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND role = 'admin'
      AND status = 'approved'
    )
  );

CREATE POLICY "Users can mark messages as read"
  ON sponsor_messages
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sponsor_users
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND role = 'admin'
      AND status = 'approved'
    )
  );

-- user_activity_log table
CREATE POLICY "Admins can view all activity"
  ON user_activity_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sponsor_users
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND role = 'admin'
      AND status = 'approved'
    )
  );

-- attendees table
CREATE POLICY "Admins can view all attendees"
  ON attendees
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sponsor_users
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND role = 'admin'
      AND status = 'approved'
    )
  );

CREATE POLICY "Admins can insert attendees"
  ON attendees
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sponsor_users
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND role = 'admin'
      AND status = 'approved'
    )
  );

CREATE POLICY "Admins can update attendees"
  ON attendees
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sponsor_users
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND role = 'admin'
      AND status = 'approved'
    )
  );

CREATE POLICY "Admins can delete attendees"
  ON attendees
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sponsor_users
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND role = 'admin'
      AND status = 'approved'
    )
  );

-- event_intake_items table
CREATE POLICY "Admins can view intake items"
  ON event_intake_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sponsor_users
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND role = 'admin'
      AND status = 'approved'
    )
  );

CREATE POLICY "Admins can insert intake items"
  ON event_intake_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sponsor_users
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND role = 'admin'
      AND status = 'approved'
    )
  );

CREATE POLICY "Admins can update intake items"
  ON event_intake_items
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sponsor_users
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND role = 'admin'
      AND status = 'approved'
    )
  );

CREATE POLICY "Admins can delete intake items"
  ON event_intake_items
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sponsor_users
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND role = 'admin'
      AND status = 'approved'
    )
  );

-- intake_item_templates table
CREATE POLICY "Admins can view templates"
  ON intake_item_templates
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sponsor_users
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND role = 'admin'
      AND status = 'approved'
    )
  );

CREATE POLICY "Admins can insert templates"
  ON intake_item_templates
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sponsor_users
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND role = 'admin'
      AND status = 'approved'
    )
  );

CREATE POLICY "Admins can update templates"
  ON intake_item_templates
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sponsor_users
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND role = 'admin'
      AND status = 'approved'
    )
  );

CREATE POLICY "Admins can delete templates"
  ON intake_item_templates
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sponsor_users
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND role = 'admin'
      AND status = 'approved'
    )
  );

-- sponsor_published_attendees table
CREATE POLICY "Admins can view published attendees"
  ON sponsor_published_attendees
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sponsor_users
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND role = 'admin'
      AND status = 'approved'
    )
  );

CREATE POLICY "Admins can insert published attendees"
  ON sponsor_published_attendees
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sponsor_users
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND role = 'admin'
      AND status = 'approved'
    )
  );

CREATE POLICY "Admins can delete published attendees"
  ON sponsor_published_attendees
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sponsor_users
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND role = 'admin'
      AND status = 'approved'
    )
  );
