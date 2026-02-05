/*
  # Create Event Targeting Change Log System

  1. New Tables
    - `event_targeting_change_log`
      - `id` (uuid, primary key)
      - `sponsor_id` (uuid, foreign key to sponsors)
      - `event_id` (text, the event identifier)
      - `user_email` (text, email of user who made the change)
      - `changes` (jsonb, detailed changes made)
      - `ip_address` (text, nullable)
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on `event_targeting_change_log` table
    - Add policy for account managers and admins to view all change logs
    - No update or delete policies - logs are immutable
    - Add indexes for performance on sponsor_id and event_id
  
  3. Important Notes
    - Change logs are immutable once created
    - Only account managers and admins can view change logs
    - Sponsors cannot view the audit trail
*/

-- Create the change log table
CREATE TABLE IF NOT EXISTS event_targeting_change_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id uuid NOT NULL REFERENCES sponsors(id) ON DELETE CASCADE,
  event_id text NOT NULL,
  user_email text NOT NULL,
  changes jsonb NOT NULL DEFAULT '{}'::jsonb,
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_targeting_change_log_sponsor_id 
  ON event_targeting_change_log(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_targeting_change_log_event_id 
  ON event_targeting_change_log(event_id);
CREATE INDEX IF NOT EXISTS idx_targeting_change_log_created_at 
  ON event_targeting_change_log(created_at DESC);

-- Enable RLS
ALTER TABLE event_targeting_change_log ENABLE ROW LEVEL SECURITY;

-- Create helper function to check if user is admin or account manager
CREATE OR REPLACE FUNCTION is_admin_or_account_manager_by_email()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role INTO user_role
  FROM sponsor_users
  WHERE email = auth.jwt() ->> 'email';
  
  RETURN user_role IN ('admin', 'account_manager');
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;

-- Policy: Only admins and account managers can view change logs
CREATE POLICY "Admins and account managers can view all change logs"
  ON event_targeting_change_log
  FOR SELECT
  TO authenticated
  USING (is_admin_or_account_manager_by_email());

-- Policy: Authenticated sponsors can insert their own change logs
CREATE POLICY "Sponsors can insert their own change logs"
  ON event_targeting_change_log
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sponsor_users
      WHERE sponsor_users.email = auth.jwt() ->> 'email'
      AND sponsor_users.sponsor_id = event_targeting_change_log.sponsor_id
    )
  );