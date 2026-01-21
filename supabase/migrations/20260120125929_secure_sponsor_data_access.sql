/*
  # Secure Sponsor Data Access

  1. Security Changes
    - Remove dangerous public policies from critical tables
    - Lock down attendee access (admins/account managers only)
    - Enable sponsor read access to their own events
    - Enable sponsor read/update access to their own intake forms
    - Enable sponsor read access to their published attendees

  2. New Tables (from sponsor_leads system)
    - `sponsor_leads` - Manually published attendee data per sponsor
    - `sponsor_event_settings` - Per-event settings for lead management

  3. Helper Functions
    - Create `is_admin()` alias for cleaner policy syntax

  4. Important Notes
    - Sponsors can ONLY see attendee data that is explicitly published by admins
    - All attendee source tables remain admin/account manager only
    - Sponsors automatically see events they're associated with
    - Sponsors can view and update their event intake checklists
*/

-- ============================================================================
-- STEP 1: Create Helper Functions
-- ============================================================================

-- Create is_admin() as a cleaner alias
CREATE OR REPLACE FUNCTION is_admin() 
RETURNS boolean 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
BEGIN
  RETURN check_is_admin();
END;
$$;

-- ============================================================================
-- STEP 2: Remove Dangerous Public Policies
-- ============================================================================

-- Remove public policies from attendees table (no sponsor access to raw data)
DROP POLICY IF EXISTS "Public can view attendees" ON attendees;

-- Remove public policies from event_attendees table
DROP POLICY IF EXISTS "Public can view event attendees" ON event_attendees;

-- Remove dangerous public write policies from sponsor_events
DROP POLICY IF EXISTS "Public can insert sponsor events" ON sponsor_events;
DROP POLICY IF EXISTS "Public can update sponsor events" ON sponsor_events;
DROP POLICY IF EXISTS "Public can delete sponsor events" ON sponsor_events;

-- Remove overly permissive public policies from sponsors table
DROP POLICY IF EXISTS "Allow anon to view all sponsors" ON sponsors;
DROP POLICY IF EXISTS "Allow anon to insert sponsors" ON sponsors;
DROP POLICY IF EXISTS "Allow anon to update sponsors" ON sponsors;
DROP POLICY IF EXISTS "Allow anon to delete sponsors" ON sponsors;

-- Remove public write policies from intake_item_templates
DROP POLICY IF EXISTS "Allow public insert to intake templates" ON intake_item_templates;
DROP POLICY IF EXISTS "Allow public update to intake templates" ON intake_item_templates;

-- ============================================================================
-- STEP 3: Add Sponsor Access Policies for Events
-- ============================================================================

-- Sponsors can view their own events
CREATE POLICY "Sponsors can view own events"
  ON sponsor_events
  FOR SELECT
  TO authenticated
  USING (sponsor_id = get_user_sponsor_id());

-- Keep the existing published events policy for general viewing
-- (Already exists: "Public can view published events")

-- ============================================================================
-- STEP 4: Add Sponsor Access Policies for Intake Forms
-- ============================================================================

-- Sponsors can view their own intake items
CREATE POLICY "Sponsors can view own intake items"
  ON event_intake_items
  FOR SELECT
  TO authenticated
  USING (sponsor_id = get_user_sponsor_id());

-- Sponsors can update their own intake items (mark complete, add notes)
CREATE POLICY "Sponsors can update own intake items"
  ON event_intake_items
  FOR UPDATE
  TO authenticated
  USING (sponsor_id = get_user_sponsor_id())
  WITH CHECK (sponsor_id = get_user_sponsor_id());

-- ============================================================================
-- STEP 5: Add Sponsor Access Policy for Published Attendees
-- ============================================================================

-- Sponsors can view published attendees for their events
CREATE POLICY "Sponsors can view own published attendees"
  ON sponsor_published_attendees
  FOR SELECT
  TO authenticated
  USING (sponsor_id = get_user_sponsor_id());

-- ============================================================================
-- STEP 6: Create Sponsor Leads System Tables
-- ============================================================================

-- Create sponsor_leads table
CREATE TABLE IF NOT EXISTS sponsor_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id uuid NOT NULL REFERENCES sponsors(id) ON DELETE CASCADE,
  event_id text NOT NULL,
  attendee_id text NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  company text,
  title text,
  stage text,
  approval_status text,
  source_database text NOT NULL CHECK (source_database IN ('forum_event', 'non_forum_event')),
  created_at timestamptz NOT NULL DEFAULT now(),
  notes text,
  UNIQUE(sponsor_id, attendee_id, event_id)
);

-- Create sponsor_event_settings table
CREATE TABLE IF NOT EXISTS sponsor_event_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id uuid NOT NULL REFERENCES sponsors(id) ON DELETE CASCADE,
  event_id text NOT NULL,
  push_leads_enabled boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(sponsor_id, event_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_sponsor_leads_sponsor_id ON sponsor_leads(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_sponsor_leads_event_id ON sponsor_leads(event_id);
CREATE INDEX IF NOT EXISTS idx_sponsor_leads_email ON sponsor_leads(email);
CREATE INDEX IF NOT EXISTS idx_sponsor_event_settings_lookup ON sponsor_event_settings(sponsor_id, event_id);

-- ============================================================================
-- STEP 7: Enable RLS and Create Policies for Sponsor Leads
-- ============================================================================

-- Enable RLS
ALTER TABLE sponsor_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsor_event_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sponsor_leads
CREATE POLICY "Admins can view all leads"
  ON sponsor_leads
  FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Account managers can view all leads"
  ON sponsor_leads
  FOR SELECT
  TO authenticated
  USING (has_management_access());

CREATE POLICY "Sponsors can view own leads"
  ON sponsor_leads
  FOR SELECT
  TO authenticated
  USING (sponsor_id = get_user_sponsor_id());

CREATE POLICY "Admins can insert leads"
  ON sponsor_leads
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Account managers can insert leads"
  ON sponsor_leads
  FOR INSERT
  TO authenticated
  WITH CHECK (has_management_access());

CREATE POLICY "Admins can update leads"
  ON sponsor_leads
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Account managers can update leads"
  ON sponsor_leads
  FOR UPDATE
  TO authenticated
  USING (has_management_access())
  WITH CHECK (has_management_access());

CREATE POLICY "Sponsors can update own lead notes"
  ON sponsor_leads
  FOR UPDATE
  TO authenticated
  USING (sponsor_id = get_user_sponsor_id())
  WITH CHECK (sponsor_id = get_user_sponsor_id());

CREATE POLICY "Admins can delete leads"
  ON sponsor_leads
  FOR DELETE
  TO authenticated
  USING (is_admin());

CREATE POLICY "Account managers can delete leads"
  ON sponsor_leads
  FOR DELETE
  TO authenticated
  USING (has_management_access());

-- RLS Policies for sponsor_event_settings
CREATE POLICY "Admins can view all settings"
  ON sponsor_event_settings
  FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Account managers can view all settings"
  ON sponsor_event_settings
  FOR SELECT
  TO authenticated
  USING (has_management_access());

CREATE POLICY "Sponsors can view own settings"
  ON sponsor_event_settings
  FOR SELECT
  TO authenticated
  USING (sponsor_id = get_user_sponsor_id());

CREATE POLICY "Admins can insert settings"
  ON sponsor_event_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Account managers can insert settings"
  ON sponsor_event_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (has_management_access());

CREATE POLICY "Admins can update settings"
  ON sponsor_event_settings
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Account managers can update settings"
  ON sponsor_event_settings
  FOR UPDATE
  TO authenticated
  USING (has_management_access())
  WITH CHECK (has_management_access());

CREATE POLICY "Admins can delete settings"
  ON sponsor_event_settings
  FOR DELETE
  TO authenticated
  USING (is_admin());

CREATE POLICY "Account managers can delete settings"
  ON sponsor_event_settings
  FOR DELETE
  TO authenticated
  USING (has_management_access());