/*
  # Add Account Manager Role

  1. Changes to Existing Tables
    - `sponsor_users`
      - Update role constraint to include 'account_manager'
      - Account managers can manage sponsors and events but cannot manage other users

  2. New Helper Functions
    - `is_account_manager()` - Check if current user is an account manager
    - `has_management_access()` - Check if user is admin or account manager

  3. Security Updates
    - Account managers can view all sponsors and events
    - Account managers can update sponsors and events
    - Account managers cannot manage users or other account managers
    - Only admins can manage account managers

  4. Role Definitions
    - **admin**: Full system access, manages all users and settings
    - **account_manager**: Manages sponsors, events, and attendees, cannot manage users
    - **sponsor**: Limited access to their own sponsor profile and events
*/

-- Drop the existing constraint and add new one with account_manager role
ALTER TABLE sponsor_users DROP CONSTRAINT IF EXISTS sponsor_users_role_check;
ALTER TABLE sponsor_users ADD CONSTRAINT sponsor_users_role_check 
  CHECK (role IN ('sponsor', 'admin', 'account_manager'));

-- Helper function to check if current user is account manager
CREATE OR REPLACE FUNCTION is_account_manager()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM sponsor_users
    WHERE id = auth.uid()
    AND role = 'account_manager'
    AND status = 'approved'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user has management access (admin or account manager)
CREATE OR REPLACE FUNCTION has_management_access()
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

-- Update existing policies to allow account managers where appropriate

-- Policy: Account managers can view all sponsor users (but not modify)
CREATE POLICY "Account managers can view all sponsor users"
  ON sponsor_users
  FOR SELECT
  TO authenticated
  USING (is_account_manager());

-- Update sponsors table policies for account managers
DROP POLICY IF EXISTS "Account managers can view all sponsors" ON sponsors;
CREATE POLICY "Account managers can view all sponsors"
  ON sponsors
  FOR SELECT
  TO authenticated
  USING (has_management_access());

DROP POLICY IF EXISTS "Account managers can update sponsors" ON sponsors;
CREATE POLICY "Account managers can update sponsors"
  ON sponsors
  FOR UPDATE
  TO authenticated
  USING (has_management_access())
  WITH CHECK (has_management_access());

DROP POLICY IF EXISTS "Account managers can insert sponsors" ON sponsors;
CREATE POLICY "Account managers can insert sponsors"
  ON sponsors
  FOR INSERT
  TO authenticated
  WITH CHECK (has_management_access());

-- Update sponsor_events policies for account managers
DROP POLICY IF EXISTS "Account managers can view all events" ON sponsor_events;
CREATE POLICY "Account managers can view all events"
  ON sponsor_events
  FOR SELECT
  TO authenticated
  USING (has_management_access());

DROP POLICY IF EXISTS "Account managers can update events" ON sponsor_events;
CREATE POLICY "Account managers can update events"
  ON sponsor_events
  FOR UPDATE
  TO authenticated
  USING (has_management_access())
  WITH CHECK (has_management_access());

DROP POLICY IF EXISTS "Account managers can insert events" ON sponsor_events;
CREATE POLICY "Account managers can insert events"
  ON sponsor_events
  FOR INSERT
  TO authenticated
  WITH CHECK (has_management_access());

DROP POLICY IF EXISTS "Account managers can delete events" ON sponsor_events;
CREATE POLICY "Account managers can delete events"
  ON sponsor_events
  FOR DELETE
  TO authenticated
  USING (has_management_access());

-- Update sponsor_contacts policies for account managers
DROP POLICY IF EXISTS "Account managers can view all contacts" ON sponsor_contacts;
CREATE POLICY "Account managers can view all contacts"
  ON sponsor_contacts
  FOR SELECT
  TO authenticated
  USING (has_management_access());

DROP POLICY IF EXISTS "Account managers can manage contacts" ON sponsor_contacts;
CREATE POLICY "Account managers can manage contacts"
  ON sponsor_contacts
  FOR ALL
  TO authenticated
  USING (has_management_access())
  WITH CHECK (has_management_access());

-- Update sponsor_messages policies for account managers
DROP POLICY IF EXISTS "Account managers can view all messages" ON sponsor_messages;
CREATE POLICY "Account managers can view all messages"
  ON sponsor_messages
  FOR SELECT
  TO authenticated
  USING (has_management_access());

DROP POLICY IF EXISTS "Account managers can send messages" ON sponsor_messages;
CREATE POLICY "Account managers can send messages"
  ON sponsor_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (has_management_access());

-- Update sponsor_messages sent_by_role constraint to include account_manager
ALTER TABLE sponsor_messages DROP CONSTRAINT IF EXISTS sponsor_messages_sent_by_role_check;
ALTER TABLE sponsor_messages ADD CONSTRAINT sponsor_messages_sent_by_role_check 
  CHECK (sent_by_role = ANY (ARRAY['admin'::text, 'sponsor'::text, 'account_manager'::text]));

-- Update attendees policies for account managers
DROP POLICY IF EXISTS "Account managers can view all attendees" ON attendees;
CREATE POLICY "Account managers can view all attendees"
  ON attendees
  FOR SELECT
  TO authenticated
  USING (has_management_access());

DROP POLICY IF EXISTS "Account managers can manage attendees" ON attendees;
CREATE POLICY "Account managers can manage attendees"
  ON attendees
  FOR ALL
  TO authenticated
  USING (has_management_access())
  WITH CHECK (has_management_access());

-- Update event_attendees policies for account managers
DROP POLICY IF EXISTS "Account managers can view event attendees" ON event_attendees;
CREATE POLICY "Account managers can view event attendees"
  ON event_attendees
  FOR SELECT
  TO authenticated
  USING (has_management_access());

DROP POLICY IF EXISTS "Account managers can manage event attendees" ON event_attendees;
CREATE POLICY "Account managers can manage event attendees"
  ON event_attendees
  FOR ALL
  TO authenticated
  USING (has_management_access())
  WITH CHECK (has_management_access());

-- Update intake_item_templates policies for account managers
DROP POLICY IF EXISTS "Account managers can view intake templates" ON intake_item_templates;
CREATE POLICY "Account managers can view intake templates"
  ON intake_item_templates
  FOR SELECT
  TO authenticated
  USING (has_management_access());

DROP POLICY IF EXISTS "Account managers can manage intake templates" ON intake_item_templates;
CREATE POLICY "Account managers can manage intake templates"
  ON intake_item_templates
  FOR ALL
  TO authenticated
  USING (has_management_access())
  WITH CHECK (has_management_access());

-- Update event_intake_items policies for account managers
DROP POLICY IF EXISTS "Account managers can view intake items" ON event_intake_items;
CREATE POLICY "Account managers can view intake items"
  ON event_intake_items
  FOR SELECT
  TO authenticated
  USING (has_management_access());

DROP POLICY IF EXISTS "Account managers can manage intake items" ON event_intake_items;
CREATE POLICY "Account managers can manage intake items"
  ON event_intake_items
  FOR ALL
  TO authenticated
  USING (has_management_access())
  WITH CHECK (has_management_access());

-- Update user_activity_log policies for account managers
DROP POLICY IF EXISTS "Account managers can view activity logs" ON user_activity_log;
CREATE POLICY "Account managers can view activity logs"
  ON user_activity_log
  FOR SELECT
  TO authenticated
  USING (has_management_access());

-- Update sponsor_published_attendees policies for account managers
DROP POLICY IF EXISTS "Account managers can view published attendees" ON sponsor_published_attendees;
CREATE POLICY "Account managers can view published attendees"
  ON sponsor_published_attendees
  FOR SELECT
  TO authenticated
  USING (has_management_access());

DROP POLICY IF EXISTS "Account managers can manage published attendees" ON sponsor_published_attendees;
CREATE POLICY "Account managers can manage published attendees"
  ON sponsor_published_attendees
  FOR ALL
  TO authenticated
  USING (has_management_access())
  WITH CHECK (has_management_access());
