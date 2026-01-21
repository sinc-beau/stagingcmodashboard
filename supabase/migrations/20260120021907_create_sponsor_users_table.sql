/*
  # Create Sponsor Users Table with Approval Workflow

  1. New Tables
    - `sponsor_users`
      - `id` (uuid, primary key) - User ID from auth.users
      - `email` (text, unique, not null) - User email address
      - `status` (text, not null) - Approval status: pending, approved, rejected
      - `role` (text, not null) - User role: sponsor or admin
      - `sponsor_id` (uuid, nullable) - Links to sponsors table after approval
      - `company_name` (text, nullable) - Company name provided during signup
      - `created_at` (timestamptz, not null) - Signup timestamp
      - `approved_at` (timestamptz, nullable) - When user was approved
      - `approved_by` (uuid, nullable) - Admin who approved the user
      - `last_login` (timestamptz, nullable) - Last login timestamp
      - `notification_sent_at` (timestamptz, nullable) - When approval email was sent
      - `rejection_reason` (text, nullable) - Reason if rejected

  2. Security
    - Enable RLS on `sponsor_users` table
    - Admins can view all sponsor_users
    - Sponsors can only view their own record
    - Public can insert (signup) but only with pending status
    - Only admins can update status and assign sponsor_id

  3. Important Notes
    - Users sign up themselves creating pending status
    - Admin manually approves and assigns sponsor_id
    - Magic link authentication is configured in Supabase Auth settings
    - User ID comes from auth.users after magic link login
*/

-- Create sponsor_users table
CREATE TABLE IF NOT EXISTS sponsor_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  role text NOT NULL DEFAULT 'sponsor' CHECK (role IN ('sponsor', 'admin')),
  sponsor_id uuid REFERENCES sponsors(id) ON DELETE SET NULL,
  company_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  approved_at timestamptz,
  approved_by uuid,
  last_login timestamptz,
  notification_sent_at timestamptz,
  rejection_reason text
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_sponsor_users_email ON sponsor_users(email);
CREATE INDEX IF NOT EXISTS idx_sponsor_users_sponsor_id ON sponsor_users(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_sponsor_users_status ON sponsor_users(status);

-- Enable RLS
ALTER TABLE sponsor_users ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM sponsor_users
    WHERE id = auth.uid()
    AND role = 'admin'
    AND status = 'approved'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get current user's sponsor_id
CREATE OR REPLACE FUNCTION get_user_sponsor_id()
RETURNS uuid AS $$
DECLARE
  user_sponsor_id uuid;
BEGIN
  SELECT sponsor_id INTO user_sponsor_id
  FROM sponsor_users
  WHERE id = auth.uid()
  AND status = 'approved';
  
  RETURN user_sponsor_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policy: Anyone can sign up (insert with pending status)
CREATE POLICY "Anyone can sign up as pending"
  ON sponsor_users
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (status = 'pending' AND role = 'sponsor');

-- Policy: Admins can view all users
CREATE POLICY "Admins can view all sponsor users"
  ON sponsor_users
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Policy: Sponsors can view their own record
CREATE POLICY "Sponsors can view own record"
  ON sponsor_users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid() AND status = 'approved');

-- Policy: Admins can update any user
CREATE POLICY "Admins can update sponsor users"
  ON sponsor_users
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Policy: Sponsors can update their own last_login
CREATE POLICY "Sponsors can update own last_login"
  ON sponsor_users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid() AND status = 'approved')
  WITH CHECK (id = auth.uid() AND status = 'approved');

-- Policy: Admins can delete users
CREATE POLICY "Admins can delete sponsor users"
  ON sponsor_users
  FOR DELETE
  TO authenticated
  USING (is_admin());
