/*
  # Update all tables to use SECURITY DEFINER helper
  
  1. Changes
    - Update all admin policies across tables to use check_is_admin() function
    - This prevents circular dependencies
*/

-- Update sponsors table
DROP POLICY IF EXISTS "Admins can view all sponsors" ON sponsors;
DROP POLICY IF EXISTS "Admins can insert sponsors" ON sponsors;
DROP POLICY IF EXISTS "Admins can update sponsors" ON sponsors;
DROP POLICY IF EXISTS "Admins can delete sponsors" ON sponsors;

CREATE POLICY "Admins can view all sponsors"
  ON sponsors FOR SELECT TO authenticated
  USING (check_is_admin());

CREATE POLICY "Admins can insert sponsors"
  ON sponsors FOR INSERT TO authenticated
  WITH CHECK (check_is_admin());

CREATE POLICY "Admins can update sponsors"
  ON sponsors FOR UPDATE TO authenticated
  USING (check_is_admin());

CREATE POLICY "Admins can delete sponsors"
  ON sponsors FOR DELETE TO authenticated
  USING (check_is_admin());

-- Update sponsor_events table
DROP POLICY IF EXISTS "Admins can view all events" ON sponsor_events;
DROP POLICY IF EXISTS "Admins can insert events" ON sponsor_events;
DROP POLICY IF EXISTS "Admins can update events" ON sponsor_events;
DROP POLICY IF EXISTS "Admins can delete events" ON sponsor_events;

CREATE POLICY "Admins can view all events"
  ON sponsor_events FOR SELECT TO authenticated
  USING (check_is_admin());

CREATE POLICY "Admins can insert events"
  ON sponsor_events FOR INSERT TO authenticated
  WITH CHECK (check_is_admin());

CREATE POLICY "Admins can update events"
  ON sponsor_events FOR UPDATE TO authenticated
  USING (check_is_admin());

CREATE POLICY "Admins can delete events"
  ON sponsor_events FOR DELETE TO authenticated
  USING (check_is_admin());

-- Update sponsor_contacts table
DROP POLICY IF EXISTS "Admins can view all contacts" ON sponsor_contacts;
DROP POLICY IF EXISTS "Admins can insert contacts" ON sponsor_contacts;
DROP POLICY IF EXISTS "Admins can update contacts" ON sponsor_contacts;
DROP POLICY IF EXISTS "Admins can delete contacts" ON sponsor_contacts;

CREATE POLICY "Admins can view all contacts"
  ON sponsor_contacts FOR SELECT TO authenticated
  USING (check_is_admin());

CREATE POLICY "Admins can insert contacts"
  ON sponsor_contacts FOR INSERT TO authenticated
  WITH CHECK (check_is_admin());

CREATE POLICY "Admins can update contacts"
  ON sponsor_contacts FOR UPDATE TO authenticated
  USING (check_is_admin());

CREATE POLICY "Admins can delete contacts"
  ON sponsor_contacts FOR DELETE TO authenticated
  USING (check_is_admin());

-- Update sponsor_messages table
DROP POLICY IF EXISTS "Admins can view all messages" ON sponsor_messages;
DROP POLICY IF EXISTS "Admins can send messages" ON sponsor_messages;
DROP POLICY IF EXISTS "Users can mark messages as read" ON sponsor_messages;

CREATE POLICY "Admins can view all messages"
  ON sponsor_messages FOR SELECT TO authenticated
  USING (check_is_admin());

CREATE POLICY "Admins can send messages"
  ON sponsor_messages FOR INSERT TO authenticated
  WITH CHECK (check_is_admin());

CREATE POLICY "Users can mark messages as read"
  ON sponsor_messages FOR UPDATE TO authenticated
  USING (check_is_admin());

-- Update user_activity_log table
DROP POLICY IF EXISTS "Admins can view all activity" ON user_activity_log;

CREATE POLICY "Admins can view all activity"
  ON user_activity_log FOR SELECT TO authenticated
  USING (check_is_admin());

-- Update attendees table
DROP POLICY IF EXISTS "Admins can view all attendees" ON attendees;
DROP POLICY IF EXISTS "Admins can insert attendees" ON attendees;
DROP POLICY IF EXISTS "Admins can update attendees" ON attendees;
DROP POLICY IF EXISTS "Admins can delete attendees" ON attendees;

CREATE POLICY "Admins can view all attendees"
  ON attendees FOR SELECT TO authenticated
  USING (check_is_admin());

CREATE POLICY "Admins can insert attendees"
  ON attendees FOR INSERT TO authenticated
  WITH CHECK (check_is_admin());

CREATE POLICY "Admins can update attendees"
  ON attendees FOR UPDATE TO authenticated
  USING (check_is_admin());

CREATE POLICY "Admins can delete attendees"
  ON attendees FOR DELETE TO authenticated
  USING (check_is_admin());

-- Update event_intake_items table
DROP POLICY IF EXISTS "Admins can view intake items" ON event_intake_items;
DROP POLICY IF EXISTS "Admins can insert intake items" ON event_intake_items;
DROP POLICY IF EXISTS "Admins can update intake items" ON event_intake_items;
DROP POLICY IF EXISTS "Admins can delete intake items" ON event_intake_items;

CREATE POLICY "Admins can view intake items"
  ON event_intake_items FOR SELECT TO authenticated
  USING (check_is_admin());

CREATE POLICY "Admins can insert intake items"
  ON event_intake_items FOR INSERT TO authenticated
  WITH CHECK (check_is_admin());

CREATE POLICY "Admins can update intake items"
  ON event_intake_items FOR UPDATE TO authenticated
  USING (check_is_admin());

CREATE POLICY "Admins can delete intake items"
  ON event_intake_items FOR DELETE TO authenticated
  USING (check_is_admin());

-- Update intake_item_templates table
DROP POLICY IF EXISTS "Admins can view templates" ON intake_item_templates;
DROP POLICY IF EXISTS "Admins can insert templates" ON intake_item_templates;
DROP POLICY IF EXISTS "Admins can update templates" ON intake_item_templates;
DROP POLICY IF EXISTS "Admins can delete templates" ON intake_item_templates;

CREATE POLICY "Admins can view templates"
  ON intake_item_templates FOR SELECT TO authenticated
  USING (check_is_admin());

CREATE POLICY "Admins can insert templates"
  ON intake_item_templates FOR INSERT TO authenticated
  WITH CHECK (check_is_admin());

CREATE POLICY "Admins can update templates"
  ON intake_item_templates FOR UPDATE TO authenticated
  USING (check_is_admin());

CREATE POLICY "Admins can delete templates"
  ON intake_item_templates FOR DELETE TO authenticated
  USING (check_is_admin());

-- Update sponsor_published_attendees table
DROP POLICY IF EXISTS "Admins can view published attendees" ON sponsor_published_attendees;
DROP POLICY IF EXISTS "Admins can insert published attendees" ON sponsor_published_attendees;
DROP POLICY IF EXISTS "Admins can delete published attendees" ON sponsor_published_attendees;

CREATE POLICY "Admins can view published attendees"
  ON sponsor_published_attendees FOR SELECT TO authenticated
  USING (check_is_admin());

CREATE POLICY "Admins can insert published attendees"
  ON sponsor_published_attendees FOR INSERT TO authenticated
  WITH CHECK (check_is_admin());

CREATE POLICY "Admins can delete published attendees"
  ON sponsor_published_attendees FOR DELETE TO authenticated
  USING (check_is_admin());

-- Update sponsor_users admin policies
DROP POLICY IF EXISTS "Admins can update any user" ON sponsor_users;
DROP POLICY IF EXISTS "Admins can delete users" ON sponsor_users;

CREATE POLICY "Admins can update any user"
  ON sponsor_users FOR UPDATE TO authenticated
  USING (check_is_admin());

CREATE POLICY "Admins can delete users"
  ON sponsor_users FOR DELETE TO authenticated
  USING (check_is_admin());
