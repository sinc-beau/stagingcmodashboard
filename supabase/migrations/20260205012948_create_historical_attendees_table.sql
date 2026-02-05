/*
  # Create historical_attendees table

  1. New Tables
    - `historical_attendees`
      - `id` (uuid, primary key)
      - `sponsor_id` (uuid, foreign key to sponsors)
      - `name` (text)
      - `email` (text)
      - `phone` (text, nullable)
      - `company` (text, nullable)
      - `title` (text, nullable)
      - `attendance_status` (text)
      - `event_name` (text)
      - `event_type` (text)
      - `event_date` (date, nullable)
      - `source_database` (text)
      - `notes` (text, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `historical_attendees` table
    - Add policies for sponsors to view own historical data
    - Add policies for account managers and admins to view all
*/

-- Create historical_attendees table
CREATE TABLE IF NOT EXISTS historical_attendees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id uuid NOT NULL REFERENCES sponsors(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  company text,
  title text,
  attendance_status text NOT NULL DEFAULT 'pending',
  event_name text NOT NULL,
  event_type text NOT NULL,
  event_date date,
  source_database text NOT NULL DEFAULT 'ringcentral',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_historical_attendees_sponsor_id ON historical_attendees(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_historical_attendees_event_date ON historical_attendees(event_date DESC);
CREATE INDEX IF NOT EXISTS idx_historical_attendees_status ON historical_attendees(attendance_status);

-- Enable RLS
ALTER TABLE historical_attendees ENABLE ROW LEVEL SECURITY;

-- Sponsors can view own historical data
CREATE POLICY "Sponsors can view own historical attendees"
  ON historical_attendees FOR SELECT
  TO authenticated
  USING (sponsor_id = get_user_sponsor_id());

-- Account managers and admins can view all
CREATE POLICY "Account managers can view all historical attendees"
  ON historical_attendees FOR SELECT
  TO authenticated
  USING (has_management_access());

-- Account managers and admins can insert
CREATE POLICY "Account managers can insert historical attendees"
  ON historical_attendees FOR INSERT
  TO authenticated
  WITH CHECK (has_management_access());

-- Account managers and admins can update
CREATE POLICY "Account managers can update historical attendees"
  ON historical_attendees FOR UPDATE
  TO authenticated
  USING (has_management_access())
  WITH CHECK (has_management_access());

-- Account managers and admins can delete
CREATE POLICY "Account managers can delete historical attendees"
  ON historical_attendees FOR DELETE
  TO authenticated
  USING (has_management_access());
