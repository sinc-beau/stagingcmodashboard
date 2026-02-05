/*
  # Create Intake Form and Target Profile Templates System

  ## Overview
  Creates comprehensive templates system for both intake forms and target attendee profiles,
  with event-type-specific filtering and complete change audit logging.

  ## 1. New Tables
  
  ### intake_form_templates
  Stores reusable intake form templates for sponsors
  - `id` (uuid, primary key)
  - `sponsor_id` (uuid, references sponsors)
  - `template_name` (text, required)
  - `event_type` (text, required) - Forum, Dinner, VRT, etc.
  - `form_data` (jsonb, required) - Complete snapshot of all intake form fields
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  - `created_by_email` (text, required)
  
  ### intake_form_change_log
  Tracks all changes to intake forms with detailed audit trail
  - `id` (uuid, primary key)
  - `sponsor_id` (uuid, references sponsors)
  - `event_id` (uuid, references events) - null for template changes
  - `template_id` (uuid, references intake_form_templates) - null for event changes
  - `user_email` (text, required)
  - `changes` (jsonb, required) - Detailed field-by-field changes
  - `created_at` (timestamptz)
  
  ### target_profile_templates
  Stores reusable target attendee profile templates for sponsors
  - `id` (uuid, primary key)
  - `sponsor_id` (uuid, references sponsors)
  - `template_name` (text, required)
  - `event_type` (text, required)
  - `technologies` (jsonb) - Array of selected technologies
  - `other_technologies` (text) - Custom technologies text
  - `seniority_levels` (jsonb) - Array of selected seniority levels
  - `job_titles` (jsonb) - Array of selected job titles
  - `excluded_titles` (text) - Excluded job titles text
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  - `created_by_email` (text, required)

  ## 2. Updates to Existing Tables
  
  ### event_targeting_change_log
  - Add `template_id` column to distinguish template vs event changes
  - Either event_id or template_id will be populated, not both
  
  ## 3. Security
  - Enable RLS on all new tables
  - Sponsors can only access their own templates
  - Admins and account managers can view all templates
  - Change logs accessible to sponsors for their data
  
  ## 4. Constraints
  - Unique constraint on (sponsor_id, template_name, event_type) for both template tables
  - Check constraints to ensure either event_id or template_id is set in change logs
*/

-- Create intake_form_templates table
CREATE TABLE IF NOT EXISTS intake_form_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id uuid NOT NULL REFERENCES sponsors(id) ON DELETE CASCADE,
  template_name text NOT NULL,
  event_type text NOT NULL,
  form_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by_email text NOT NULL,
  CONSTRAINT unique_intake_template_per_sponsor_event_type 
    UNIQUE (sponsor_id, template_name, event_type)
);

-- Create intake_form_change_log table
CREATE TABLE IF NOT EXISTS intake_form_change_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id uuid NOT NULL REFERENCES sponsors(id) ON DELETE CASCADE,
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  template_id uuid REFERENCES intake_form_templates(id) ON DELETE CASCADE,
  user_email text NOT NULL,
  changes jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT intake_log_must_have_event_or_template 
    CHECK (
      (event_id IS NOT NULL AND template_id IS NULL) OR 
      (event_id IS NULL AND template_id IS NOT NULL)
    )
);

-- Create target_profile_templates table
CREATE TABLE IF NOT EXISTS target_profile_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id uuid NOT NULL REFERENCES sponsors(id) ON DELETE CASCADE,
  template_name text NOT NULL,
  event_type text NOT NULL,
  technologies jsonb DEFAULT '[]'::jsonb,
  other_technologies text DEFAULT '',
  seniority_levels jsonb DEFAULT '[]'::jsonb,
  job_titles jsonb DEFAULT '[]'::jsonb,
  excluded_titles text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by_email text NOT NULL,
  CONSTRAINT unique_target_template_per_sponsor_event_type 
    UNIQUE (sponsor_id, template_name, event_type)
);

-- Update event_targeting_change_log to support template changes
ALTER TABLE event_targeting_change_log 
  ADD COLUMN IF NOT EXISTS template_id uuid REFERENCES target_profile_templates(id) ON DELETE CASCADE;

-- Add constraint to ensure either event_id or template_id is set
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'targeting_log_must_have_event_or_template'
  ) THEN
    ALTER TABLE event_targeting_change_log 
      ADD CONSTRAINT targeting_log_must_have_event_or_template 
      CHECK (
        (event_id IS NOT NULL AND template_id IS NULL) OR 
        (event_id IS NULL AND template_id IS NOT NULL)
      );
  END IF;
END $$;

-- Enable RLS on all new tables
ALTER TABLE intake_form_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE intake_form_change_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE target_profile_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for intake_form_templates
CREATE POLICY "Sponsors can view own intake templates"
  ON intake_form_templates FOR SELECT
  TO authenticated
  USING (
    sponsor_id IN (
      SELECT id FROM sponsors WHERE id IN (
        SELECT sponsor_id FROM sponsor_users WHERE email = auth.jwt()->>'email'
      )
    )
  );

CREATE POLICY "Admins and account managers can view all intake templates"
  ON intake_form_templates FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sponsor_users 
      WHERE email = auth.jwt()->>'email' 
      AND role IN ('admin', 'account_manager')
    )
  );

CREATE POLICY "Sponsors can insert own intake templates"
  ON intake_form_templates FOR INSERT
  TO authenticated
  WITH CHECK (
    sponsor_id IN (
      SELECT id FROM sponsors WHERE id IN (
        SELECT sponsor_id FROM sponsor_users WHERE email = auth.jwt()->>'email'
      )
    )
  );

CREATE POLICY "Sponsors can update own intake templates"
  ON intake_form_templates FOR UPDATE
  TO authenticated
  USING (
    sponsor_id IN (
      SELECT id FROM sponsors WHERE id IN (
        SELECT sponsor_id FROM sponsor_users WHERE email = auth.jwt()->>'email'
      )
    )
  );

CREATE POLICY "Sponsors can delete own intake templates"
  ON intake_form_templates FOR DELETE
  TO authenticated
  USING (
    sponsor_id IN (
      SELECT id FROM sponsors WHERE id IN (
        SELECT sponsor_id FROM sponsor_users WHERE email = auth.jwt()->>'email'
      )
    )
  );

-- RLS Policies for intake_form_change_log
CREATE POLICY "Sponsors can view own intake change logs"
  ON intake_form_change_log FOR SELECT
  TO authenticated
  USING (
    sponsor_id IN (
      SELECT id FROM sponsors WHERE id IN (
        SELECT sponsor_id FROM sponsor_users WHERE email = auth.jwt()->>'email'
      )
    )
  );

CREATE POLICY "Admins and account managers can view all intake change logs"
  ON intake_form_change_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sponsor_users 
      WHERE email = auth.jwt()->>'email' 
      AND role IN ('admin', 'account_manager')
    )
  );

CREATE POLICY "Sponsors can insert own intake change logs"
  ON intake_form_change_log FOR INSERT
  TO authenticated
  WITH CHECK (
    sponsor_id IN (
      SELECT id FROM sponsors WHERE id IN (
        SELECT sponsor_id FROM sponsor_users WHERE email = auth.jwt()->>'email'
      )
    )
  );

-- RLS Policies for target_profile_templates
CREATE POLICY "Sponsors can view own target templates"
  ON target_profile_templates FOR SELECT
  TO authenticated
  USING (
    sponsor_id IN (
      SELECT id FROM sponsors WHERE id IN (
        SELECT sponsor_id FROM sponsor_users WHERE email = auth.jwt()->>'email'
      )
    )
  );

CREATE POLICY "Admins and account managers can view all target templates"
  ON target_profile_templates FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sponsor_users 
      WHERE email = auth.jwt()->>'email' 
      AND role IN ('admin', 'account_manager')
    )
  );

CREATE POLICY "Sponsors can insert own target templates"
  ON target_profile_templates FOR INSERT
  TO authenticated
  WITH CHECK (
    sponsor_id IN (
      SELECT id FROM sponsors WHERE id IN (
        SELECT sponsor_id FROM sponsor_users WHERE email = auth.jwt()->>'email'
      )
    )
  );

CREATE POLICY "Sponsors can update own target templates"
  ON target_profile_templates FOR UPDATE
  TO authenticated
  USING (
    sponsor_id IN (
      SELECT id FROM sponsors WHERE id IN (
        SELECT sponsor_id FROM sponsor_users WHERE email = auth.jwt()->>'email'
      )
    )
  );

CREATE POLICY "Sponsors can delete own target templates"
  ON target_profile_templates FOR DELETE
  TO authenticated
  USING (
    sponsor_id IN (
      SELECT id FROM sponsors WHERE id IN (
        SELECT sponsor_id FROM sponsor_users WHERE email = auth.jwt()->>'email'
      )
    )
  );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_intake_templates_sponsor_event_type 
  ON intake_form_templates(sponsor_id, event_type);
  
CREATE INDEX IF NOT EXISTS idx_intake_change_log_event 
  ON intake_form_change_log(event_id);
  
CREATE INDEX IF NOT EXISTS idx_intake_change_log_template 
  ON intake_form_change_log(template_id);
  
CREATE INDEX IF NOT EXISTS idx_target_templates_sponsor_event_type 
  ON target_profile_templates(sponsor_id, event_type);
  
CREATE INDEX IF NOT EXISTS idx_targeting_change_log_template 
  ON event_targeting_change_log(template_id) WHERE template_id IS NOT NULL;