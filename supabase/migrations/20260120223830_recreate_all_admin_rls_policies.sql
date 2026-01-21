/*
  # Recreate All Admin RLS Policies

  1. Changes
    - Recreate all RLS policies that were dropped when CASCADE was applied
    - These policies depend on check_is_admin() and is_admin_or_account_manager()
    - Now that those functions are SECURITY DEFINER, these policies will work correctly

  2. Tables Updated
    - sponsors (4 admin policies)
    - sponsor_contacts (4 admin policies)
    - sponsor_messages (3 policies)
    - user_activity_log (1 admin policy)
    - attendees (4 admin policies)
    - event_intake_items (4 admin policies)
    - intake_item_templates (4 admin policies)
    - sponsor_published_attendees (3 admin policies)
    - sponsor_users (3 admin policies)
    - events (1 admin policy)
    - sponsor_events (1 admin policy)

  3. Security
    - All policies use SECURITY DEFINER functions
    - Proper role and status checks in place
*/

-- sponsors table policies
CREATE POLICY "Admins can view all sponsors"
  ON sponsors FOR SELECT
  TO authenticated
  USING (check_is_admin());

CREATE POLICY "Admins can insert sponsors"
  ON sponsors FOR INSERT
  TO authenticated
  WITH CHECK (check_is_admin());

CREATE POLICY "Admins can update sponsors"
  ON sponsors FOR UPDATE
  TO authenticated
  USING (check_is_admin())
  WITH CHECK (check_is_admin());

CREATE POLICY "Admins can delete sponsors"
  ON sponsors FOR DELETE
  TO authenticated
  USING (check_is_admin());

-- sponsor_contacts table policies
CREATE POLICY "Admins can view all contacts"
  ON sponsor_contacts FOR SELECT
  TO authenticated
  USING (check_is_admin());

CREATE POLICY "Admins can insert contacts"
  ON sponsor_contacts FOR INSERT
  TO authenticated
  WITH CHECK (check_is_admin());

CREATE POLICY "Admins can update contacts"
  ON sponsor_contacts FOR UPDATE
  TO authenticated
  USING (check_is_admin())
  WITH CHECK (check_is_admin());

CREATE POLICY "Admins can delete contacts"
  ON sponsor_contacts FOR DELETE
  TO authenticated
  USING (check_is_admin());

-- sponsor_messages table policies
CREATE POLICY "Admins can view all messages"
  ON sponsor_messages FOR SELECT
  TO authenticated
  USING (check_is_admin());

CREATE POLICY "Admins can send messages"
  ON sponsor_messages FOR INSERT
  TO authenticated
  WITH CHECK (check_is_admin());

CREATE POLICY "Users can mark messages as read"
  ON sponsor_messages FOR UPDATE
  TO authenticated
  USING (check_is_admin())
  WITH CHECK (check_is_admin());

-- user_activity_log table policies
CREATE POLICY "Admins can view all activity"
  ON user_activity_log FOR SELECT
  TO authenticated
  USING (check_is_admin());

-- attendees table policies
CREATE POLICY "Admins can view all attendees"
  ON attendees FOR SELECT
  TO authenticated
  USING (check_is_admin());

CREATE POLICY "Admins can insert attendees"
  ON attendees FOR INSERT
  TO authenticated
  WITH CHECK (check_is_admin());

CREATE POLICY "Admins can update attendees"
  ON attendees FOR UPDATE
  TO authenticated
  USING (check_is_admin())
  WITH CHECK (check_is_admin());

CREATE POLICY "Admins can delete attendees"
  ON attendees FOR DELETE
  TO authenticated
  USING (check_is_admin());

-- event_intake_items table policies
CREATE POLICY "Admins can view intake items"
  ON event_intake_items FOR SELECT
  TO authenticated
  USING (check_is_admin());

CREATE POLICY "Admins can insert intake items"
  ON event_intake_items FOR INSERT
  TO authenticated
  WITH CHECK (check_is_admin());

CREATE POLICY "Admins can update intake items"
  ON event_intake_items FOR UPDATE
  TO authenticated
  USING (check_is_admin())
  WITH CHECK (check_is_admin());

CREATE POLICY "Admins can delete intake items"
  ON event_intake_items FOR DELETE
  TO authenticated
  USING (check_is_admin());

-- intake_item_templates table policies
CREATE POLICY "Admins can view templates"
  ON intake_item_templates FOR SELECT
  TO authenticated
  USING (check_is_admin());

CREATE POLICY "Admins can insert templates"
  ON intake_item_templates FOR INSERT
  TO authenticated
  WITH CHECK (check_is_admin());

CREATE POLICY "Admins can update templates"
  ON intake_item_templates FOR UPDATE
  TO authenticated
  USING (check_is_admin())
  WITH CHECK (check_is_admin());

CREATE POLICY "Admins can delete templates"
  ON intake_item_templates FOR DELETE
  TO authenticated
  USING (check_is_admin());

-- sponsor_published_attendees table policies
CREATE POLICY "Admins can view published attendees"
  ON sponsor_published_attendees FOR SELECT
  TO authenticated
  USING (check_is_admin());

CREATE POLICY "Admins can insert published attendees"
  ON sponsor_published_attendees FOR INSERT
  TO authenticated
  WITH CHECK (check_is_admin());

CREATE POLICY "Admins can delete published attendees"
  ON sponsor_published_attendees FOR DELETE
  TO authenticated
  USING (check_is_admin());

-- sponsor_users table policies
CREATE POLICY "Admins can read all sponsor_users"
  ON sponsor_users FOR SELECT
  TO authenticated
  USING (check_is_admin());

CREATE POLICY "Admins can update any sponsor_users"
  ON sponsor_users FOR UPDATE
  TO authenticated
  USING (check_is_admin())
  WITH CHECK (check_is_admin());

CREATE POLICY "Admins can delete sponsor_users"
  ON sponsor_users FOR DELETE
  TO authenticated
  USING (check_is_admin());

-- events table policies
CREATE POLICY "Admins can manage events"
  ON events FOR ALL
  TO authenticated
  USING (check_is_admin())
  WITH CHECK (check_is_admin());

-- sponsor_events table policies
CREATE POLICY "Admins can manage sponsor events"
  ON sponsor_events FOR ALL
  TO authenticated
  USING (check_is_admin())
  WITH CHECK (check_is_admin());
