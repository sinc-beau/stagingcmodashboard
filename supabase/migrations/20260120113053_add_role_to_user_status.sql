/*
  # Add Role to User Status Helper Table
  
  1. Changes
    - Add `role` column to `user_status` table (admin, sponsor, account_manager)
    - Update existing records with roles from sponsor_users
    - Update trigger to sync role changes
    
  2. Purpose
    - Allows anonymous users to check both status and role during login
    - Avoids needing to query sponsor_users table which has restrictive RLS
*/

-- Add role column
ALTER TABLE user_status 
ADD COLUMN IF NOT EXISTS role text DEFAULT 'sponsor' 
CHECK (role IN ('admin', 'sponsor', 'account_manager'));

-- Sync existing roles from sponsor_users
UPDATE user_status us
SET role = su.role
FROM sponsor_users su
JOIN auth.users au ON au.email = su.email
WHERE us.user_id = au.id;

-- Update the trigger function to sync both status and role
CREATE OR REPLACE FUNCTION sync_user_status()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO user_status (user_id, status, role)
    SELECT id, NEW.status, NEW.role
    FROM auth.users
    WHERE email = NEW.email
    ON CONFLICT (user_id) DO UPDATE
    SET status = EXCLUDED.status, role = EXCLUDED.role, updated_at = now();
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE user_status
    SET 
      status = NEW.status,
      role = NEW.role,
      updated_at = now()
    WHERE user_id IN (
      SELECT id FROM auth.users WHERE email = NEW.email
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
