/*
  # Add File Uploads and Detailed Targeting to Event Intake System

  1. Changes to event_intake_items
    - Add file_url column for single file uploads (logo, headshot, etc.)
    - Add file_urls column for multiple file uploads (digital assets)
    
  2. New Table: event_targeting_data
    - Store detailed targeting information per sponsor per event
    - Technologies with relevance levels
    - Seniority levels with relevance levels
    - Job titles/roles with relevance levels
    - Excluded job titles
    
  3. Security
    - Enable RLS on event_targeting_data
    - Policies for sponsors to manage their targeting data
*/

-- Add file upload columns to event_intake_items
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'event_intake_items' AND column_name = 'file_url'
  ) THEN
    ALTER TABLE event_intake_items ADD COLUMN file_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'event_intake_items' AND column_name = 'file_urls'
  ) THEN
    ALTER TABLE event_intake_items ADD COLUMN file_urls jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Create event_targeting_data table
CREATE TABLE IF NOT EXISTS event_targeting_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id uuid NOT NULL REFERENCES sponsors(id) ON DELETE CASCADE,
  event_id text NOT NULL,
  event_name text NOT NULL,
  
  -- Technologies with relevance
  technologies jsonb DEFAULT '[]'::jsonb,
  other_technologies text,
  
  -- Seniority levels with relevance
  seniority_levels jsonb DEFAULT '[]'::jsonb,
  
  -- Job titles/roles with relevance
  job_titles jsonb DEFAULT '[]'::jsonb,
  
  -- Excluded job titles
  excluded_titles text,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(sponsor_id, event_id)
);

ALTER TABLE event_targeting_data ENABLE ROW LEVEL SECURITY;

-- RLS policies for event_targeting_data
CREATE POLICY "Sponsors can view own targeting data"
  ON event_targeting_data FOR SELECT
  TO authenticated
  USING (
    sponsor_id IN (
      SELECT sponsor_id 
      FROM sponsor_users 
      WHERE email = auth.email()
    )
  );

CREATE POLICY "Sponsors can insert own targeting data"
  ON event_targeting_data FOR INSERT
  TO authenticated
  WITH CHECK (
    sponsor_id IN (
      SELECT sponsor_id 
      FROM sponsor_users 
      WHERE email = auth.email()
    )
  );

CREATE POLICY "Sponsors can update own targeting data"
  ON event_targeting_data FOR UPDATE
  TO authenticated
  USING (
    sponsor_id IN (
      SELECT sponsor_id 
      FROM sponsor_users 
      WHERE email = auth.email()
    )
  )
  WITH CHECK (
    sponsor_id IN (
      SELECT sponsor_id 
      FROM sponsor_users 
      WHERE email = auth.email()
    )
  );

CREATE POLICY "Admins and account managers can view all targeting data"
  ON event_targeting_data FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sponsor_users
      WHERE email = auth.email()
      AND role IN ('admin', 'account_manager')
    )
  );

CREATE POLICY "Admins and account managers can update all targeting data"
  ON event_targeting_data FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sponsor_users
      WHERE email = auth.email()
      AND role IN ('admin', 'account_manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sponsor_users
      WHERE email = auth.email()
      AND role IN ('admin', 'account_manager')
    )
  );