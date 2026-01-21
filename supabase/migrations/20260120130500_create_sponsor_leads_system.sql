/*
  # Create Sponsor Leads System

  1. New Tables
    - `sponsor_leads`
      - `id` (uuid, primary key) - Unique lead ID
      - `sponsor_id` (uuid, not null) - Links to sponsors table
      - `event_id` (text, not null) - The sponsor_events.id
      - `attendee_id` (text, not null) - Original attendee ID from source database
      - `name` (text, not null) - Attendee name
      - `email` (text, not null) - Attendee email
      - `company` (text, nullable) - Attendee company
      - `title` (text, nullable) - Attendee title
      - `stage` (text, nullable) - Forum attendee stage (1-4)
      - `approval_status` (text, nullable) - Non-forum approval status
      - `source_database` (text, not null) - forum_event or non_forum_event
      - `created_at` (timestamptz, not null) - When lead was added
      - `notes` (text, nullable) - Sponsor notes about this lead
      - Unique constraint on (sponsor_id, attendee_id, event_id) to prevent duplicates

    - `sponsor_event_settings`
      - `id` (uuid, primary key)
      - `sponsor_id` (uuid, not null) - Links to sponsors table
      - `event_id` (text, not null) - Links to sponsor_events.id
      - `push_leads_enabled` (boolean, default false) - Whether to auto-push leads
      - `created_at` (timestamptz, not null)
      - `updated_at` (timestamptz, not null)
      - Unique constraint on (sponsor_id, event_id)

  2. Security
    - Enable RLS on both tables
    - Admins can view/modify all records
    - Sponsors can only view/modify their own records

  3. Important Notes
    - Leads are manually or automatically pushed from events
    - Each lead is unique per sponsor/attendee/event combination
    - Settings control whether leads auto-push per event
*/

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

-- Enable RLS
ALTER TABLE sponsor_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsor_event_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sponsor_leads
CREATE POLICY "Admins can view all leads"
  ON sponsor_leads
  FOR SELECT
  TO authenticated
  USING (is_admin());

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

CREATE POLICY "Admins can update leads"
  ON sponsor_leads
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

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

-- RLS Policies for sponsor_event_settings
CREATE POLICY "Admins can view all settings"
  ON sponsor_event_settings
  FOR SELECT
  TO authenticated
  USING (is_admin());

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

CREATE POLICY "Admins can update settings"
  ON sponsor_event_settings
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete settings"
  ON sponsor_event_settings
  FOR DELETE
  TO authenticated
  USING (is_admin());
