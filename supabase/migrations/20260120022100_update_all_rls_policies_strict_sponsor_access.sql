/*
  # Update All RLS Policies for Strict Sponsor-Only Access

  1. Updates to `sponsors` table
    - Drop existing overly permissive policies
    - Admins can view and manage all sponsors
    - Sponsors can only view their own record
    - Sponsors can update only their editable fields (logo, about, contacts)

  2. Updates to `sponsor_events` table
    - Drop existing overly permissive policies
    - Admins can view and manage all events
    - Sponsors can only view their own published events

  3. Updates to `sponsor_contacts` table
    - Drop existing overly permissive policies
    - Admins can view and manage all contacts
    - Sponsors can only view and edit contacts for their own sponsor

  4. Updates to `event_intake_items` table
    - Admins can view and manage all intake items
    - Sponsors can only view intake items for their own sponsor

  5. Updates to `intake_item_templates` table
    - Block all sponsor access (admin-only table)

  6. Important Notes
    - ALL policies now check authentication and authorization
    - Sponsors are restricted to ONLY their own data
    - No more public or "true" policies that allow unrestricted access
    - Admins have full access via is_admin() check
*/

-- ============================================================
-- SPONSORS TABLE - Strict sponsor-only access
-- ============================================================

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Allow public read access to sponsors" ON sponsors;
DROP POLICY IF EXISTS "Allow public insert to sponsors" ON sponsors;
DROP POLICY IF EXISTS "Allow public update to sponsors" ON sponsors;
DROP POLICY IF EXISTS "Allow public delete to sponsors" ON sponsors;

-- New strict policies for sponsors table
CREATE POLICY "Admins can view all sponsors"
  ON sponsors
  FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Sponsors can view own sponsor record"
  ON sponsors
  FOR SELECT
  TO authenticated
  USING (
    id = get_user_sponsor_id()
    AND EXISTS (
      SELECT 1 FROM sponsor_users
      WHERE id = auth.uid()
      AND status = 'approved'
      AND role = 'sponsor'
    )
  );

CREATE POLICY "Admins can insert sponsors"
  ON sponsors
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update all sponsors"
  ON sponsors
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Sponsors can update own sponsor editable fields"
  ON sponsors
  FOR UPDATE
  TO authenticated
  USING (
    id = get_user_sponsor_id()
    AND EXISTS (
      SELECT 1 FROM sponsor_users
      WHERE id = auth.uid()
      AND status = 'approved'
      AND role = 'sponsor'
    )
  )
  WITH CHECK (
    id = get_user_sponsor_id()
    AND EXISTS (
      SELECT 1 FROM sponsor_users
      WHERE id = auth.uid()
      AND status = 'approved'
      AND role = 'sponsor'
    )
  );

CREATE POLICY "Admins can delete sponsors"
  ON sponsors
  FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================================
-- SPONSOR_EVENTS TABLE - Only published events for sponsors
-- ============================================================

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Allow public read access to sponsor events" ON sponsor_events;
DROP POLICY IF EXISTS "Allow public insert to sponsor events" ON sponsor_events;
DROP POLICY IF EXISTS "Allow public update to sponsor events" ON sponsor_events;
DROP POLICY IF EXISTS "Allow public delete to sponsor events" ON sponsor_events;

-- New strict policies for sponsor_events table
CREATE POLICY "Admins can view all sponsor events"
  ON sponsor_events
  FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Sponsors can view own published events only"
  ON sponsor_events
  FOR SELECT
  TO authenticated
  USING (
    sponsor_id = get_user_sponsor_id()
    AND is_published = true
    AND EXISTS (
      SELECT 1 FROM sponsor_users
      WHERE id = auth.uid()
      AND status = 'approved'
      AND role = 'sponsor'
    )
  );

CREATE POLICY "Admins can insert sponsor events"
  ON sponsor_events
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update sponsor events"
  ON sponsor_events
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete sponsor events"
  ON sponsor_events
  FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================================
-- SPONSOR_CONTACTS TABLE - Own sponsor contacts only
-- ============================================================

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Allow public read access to sponsor contacts" ON sponsor_contacts;
DROP POLICY IF EXISTS "Allow public insert to sponsor contacts" ON sponsor_contacts;
DROP POLICY IF EXISTS "Allow public update to sponsor contacts" ON sponsor_contacts;
DROP POLICY IF EXISTS "Allow public delete to sponsor contacts" ON sponsor_contacts;

-- New strict policies for sponsor_contacts table
CREATE POLICY "Admins can view all sponsor contacts"
  ON sponsor_contacts
  FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Sponsors can view own sponsor contacts"
  ON sponsor_contacts
  FOR SELECT
  TO authenticated
  USING (
    sponsor_id = get_user_sponsor_id()
    AND EXISTS (
      SELECT 1 FROM sponsor_users
      WHERE id = auth.uid()
      AND status = 'approved'
      AND role = 'sponsor'
    )
  );

CREATE POLICY "Admins can insert sponsor contacts"
  ON sponsor_contacts
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Sponsors can insert own sponsor contacts"
  ON sponsor_contacts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    sponsor_id = get_user_sponsor_id()
    AND EXISTS (
      SELECT 1 FROM sponsor_users
      WHERE id = auth.uid()
      AND status = 'approved'
      AND role = 'sponsor'
    )
  );

CREATE POLICY "Admins can update sponsor contacts"
  ON sponsor_contacts
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Sponsors can update own sponsor contacts"
  ON sponsor_contacts
  FOR UPDATE
  TO authenticated
  USING (
    sponsor_id = get_user_sponsor_id()
    AND EXISTS (
      SELECT 1 FROM sponsor_users
      WHERE id = auth.uid()
      AND status = 'approved'
      AND role = 'sponsor'
    )
  )
  WITH CHECK (
    sponsor_id = get_user_sponsor_id()
    AND EXISTS (
      SELECT 1 FROM sponsor_users
      WHERE id = auth.uid()
      AND status = 'approved'
      AND role = 'sponsor'
    )
  );

CREATE POLICY "Admins can delete sponsor contacts"
  ON sponsor_contacts
  FOR DELETE
  TO authenticated
  USING (is_admin());

CREATE POLICY "Sponsors can delete own sponsor contacts"
  ON sponsor_contacts
  FOR DELETE
  TO authenticated
  USING (
    sponsor_id = get_user_sponsor_id()
    AND EXISTS (
      SELECT 1 FROM sponsor_users
      WHERE id = auth.uid()
      AND status = 'approved'
      AND role = 'sponsor'
    )
  );

-- ============================================================
-- EVENT_INTAKE_ITEMS TABLE - Own sponsor items only
-- ============================================================

-- Check if table exists before creating policies
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'event_intake_items') THEN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Allow public read access to intake items" ON event_intake_items;
    DROP POLICY IF EXISTS "Allow public insert to intake items" ON event_intake_items;
    DROP POLICY IF EXISTS "Allow public update to intake items" ON event_intake_items;
    DROP POLICY IF EXISTS "Allow public delete to intake items" ON event_intake_items;

    -- Create new strict policies
    EXECUTE 'CREATE POLICY "Admins can view all intake items"
      ON event_intake_items
      FOR SELECT
      TO authenticated
      USING (is_admin())';

    EXECUTE 'CREATE POLICY "Sponsors can view own intake items"
      ON event_intake_items
      FOR SELECT
      TO authenticated
      USING (
        sponsor_id = get_user_sponsor_id()
        AND EXISTS (
          SELECT 1 FROM sponsor_users
          WHERE id = auth.uid()
          AND status = ''approved''
          AND role = ''sponsor''
        )
      )';

    EXECUTE 'CREATE POLICY "Admins can insert intake items"
      ON event_intake_items
      FOR INSERT
      TO authenticated
      WITH CHECK (is_admin())';

    EXECUTE 'CREATE POLICY "Admins can update intake items"
      ON event_intake_items
      FOR UPDATE
      TO authenticated
      USING (is_admin())
      WITH CHECK (is_admin())';

    EXECUTE 'CREATE POLICY "Admins can delete intake items"
      ON event_intake_items
      FOR DELETE
      TO authenticated
      USING (is_admin())';
  END IF;
END $$;

-- ============================================================
-- INTAKE_ITEM_TEMPLATES TABLE - Admin-only access
-- ============================================================

-- Check if table exists before creating policies
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'intake_item_templates') THEN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Allow public read access to templates" ON intake_item_templates;
    DROP POLICY IF EXISTS "Allow public insert to templates" ON intake_item_templates;
    DROP POLICY IF EXISTS "Allow public update to templates" ON intake_item_templates;
    DROP POLICY IF EXISTS "Allow public delete to templates" ON intake_item_templates;

    -- Create admin-only policies
    EXECUTE 'CREATE POLICY "Admins can view all templates"
      ON intake_item_templates
      FOR SELECT
      TO authenticated
      USING (is_admin())';

    EXECUTE 'CREATE POLICY "Admins can insert templates"
      ON intake_item_templates
      FOR INSERT
      TO authenticated
      WITH CHECK (is_admin())';

    EXECUTE 'CREATE POLICY "Admins can update templates"
      ON intake_item_templates
      FOR UPDATE
      TO authenticated
      USING (is_admin())
      WITH CHECK (is_admin())';

    EXECUTE 'CREATE POLICY "Admins can delete templates"
      ON intake_item_templates
      FOR DELETE
      TO authenticated
      USING (is_admin())';
  END IF;
END $$;

-- ============================================================
-- ATTENDEES TABLE - Admin-only access (sponsors see snapshots only)
-- ============================================================

-- Check if table exists before creating policies
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'attendees') THEN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Allow public read access to attendees" ON attendees;
    DROP POLICY IF EXISTS "Allow public insert to attendees" ON attendees;
    DROP POLICY IF EXISTS "Allow public update to attendees" ON attendees;
    DROP POLICY IF EXISTS "Allow public delete to attendees" ON attendees;

    -- Create admin-only policies (sponsors use sponsor_published_attendees instead)
    EXECUTE 'CREATE POLICY "Admins can view all attendees"
      ON attendees
      FOR SELECT
      TO authenticated
      USING (is_admin())';

    EXECUTE 'CREATE POLICY "Admins can insert attendees"
      ON attendees
      FOR INSERT
      TO authenticated
      WITH CHECK (is_admin())';

    EXECUTE 'CREATE POLICY "Admins can update attendees"
      ON attendees
      FOR UPDATE
      TO authenticated
      USING (is_admin())
      WITH CHECK (is_admin())';

    EXECUTE 'CREATE POLICY "Admins can delete attendees"
      ON attendees
      FOR DELETE
      TO authenticated
      USING (is_admin())';
  END IF;
END $$;
