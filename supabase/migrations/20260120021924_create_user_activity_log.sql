/*
  # Create User Activity Log Table

  1. New Tables
    - `user_activity_log`
      - `id` (uuid, primary key)
      - `user_id` (uuid, not null) - References sponsor_users
      - `activity_type` (text, not null) - Type of activity: login, logout, view, edit, message, etc.
      - `details` (jsonb, nullable) - Additional details about the activity
      - `ip_address` (text, nullable) - IP address of the request
      - `user_agent` (text, nullable) - Browser user agent
      - `created_at` (timestamptz, not null) - When activity occurred

  2. Security
    - Enable RLS on `user_activity_log` table
    - Only admins can view activity logs
    - System can insert activity logs

  3. Important Notes
    - Used for security auditing and compliance
    - Tracks all significant user actions
    - Helps identify suspicious activity patterns
*/

-- Create user_activity_log table
CREATE TABLE IF NOT EXISTS user_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  activity_type text NOT NULL,
  details jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON user_activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_activity_type ON user_activity_log(activity_type);

-- Enable RLS
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view all activity logs
CREATE POLICY "Admins can view all activity logs"
  ON user_activity_log
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Policy: System can insert activity logs (service role)
CREATE POLICY "Service role can insert activity logs"
  ON user_activity_log
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Function to log user activity
CREATE OR REPLACE FUNCTION log_user_activity(
  p_user_id uuid,
  p_activity_type text,
  p_details jsonb DEFAULT NULL,
  p_ip_address text DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO user_activity_log (user_id, activity_type, details, ip_address, user_agent)
  VALUES (p_user_id, p_activity_type, p_details, p_ip_address, p_user_agent);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
