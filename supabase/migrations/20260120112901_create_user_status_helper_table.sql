/*
  # Create User Status Helper Table
  
  1. New Tables
    - `user_status`
      - `user_id` (uuid, references auth.users, primary key)
      - `status` (text: pending, approved, rejected)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS
    - Allow anonymous read access to check login status
    - Only admins can update status
    
  3. Changes
    - This helper table allows checking user approval status before/during authentication
    - Separates publicly readable status from other sensitive user data
*/

-- Create the user status helper table
CREATE TABLE IF NOT EXISTS user_status (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_status ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access (so login page can check status)
CREATE POLICY "Anyone can view user status"
  ON user_status
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only admins can update status
CREATE POLICY "Admins can update user status"
  ON user_status
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sponsor_users
      WHERE sponsor_users.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND sponsor_users.role = 'admin'
      AND sponsor_users.status = 'approved'
    )
  );

-- Sync existing sponsor_users data to user_status
INSERT INTO user_status (user_id, status, created_at)
SELECT 
  au.id,
  su.status,
  su.created_at
FROM sponsor_users su
JOIN auth.users au ON au.email = su.email
ON CONFLICT (user_id) DO UPDATE
SET status = EXCLUDED.status;

-- Create trigger to keep user_status in sync with sponsor_users
CREATE OR REPLACE FUNCTION sync_user_status()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- When a new sponsor_user is created, create corresponding user_status
    INSERT INTO user_status (user_id, status)
    SELECT id, NEW.status
    FROM auth.users
    WHERE email = NEW.email
    ON CONFLICT (user_id) DO UPDATE
    SET status = EXCLUDED.status, updated_at = now();
  ELSIF TG_OP = 'UPDATE' THEN
    -- When sponsor_user status changes, update user_status
    UPDATE user_status
    SET status = NEW.status, updated_at = now()
    WHERE user_id IN (
      SELECT id FROM auth.users WHERE email = NEW.email
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER sync_user_status_trigger
  AFTER INSERT OR UPDATE OF status ON sponsor_users
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_status();
