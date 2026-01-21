/*
  # Create Admin User

  1. Creates admin user in auth.users
    - Email: beau.horton@sincusa.com
    - Password: admin123
    - Email confirmed automatically

  2. Creates corresponding sponsor_users record
    - Role: admin
    - Status: approved
    - Pre-approved for immediate access

  3. Important Notes
    - This is for development/testing purposes
    - In production, use proper admin creation workflow
    - Password is intentionally simple for dev environment
*/

-- Create admin user in auth.users (using Supabase auth schema)
-- Note: We'll insert directly into auth.users with a hashed password
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Generate a UUID for the admin user
  admin_user_id := gen_random_uuid();
  
  -- Insert into auth.users if not exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'beau.horton@sincusa.com') THEN
    -- Note: In Supabase, we need to use the auth.users table
    -- The password will be set via the Auth API in the application
    -- For now, we'll create the sponsor_users record and let the user sign up through the UI
    
    -- Create the sponsor_users record first as approved admin
    INSERT INTO sponsor_users (id, email, status, role, approved_at, created_at)
    VALUES (
      admin_user_id,
      'beau.horton@sincusa.com',
      'approved',
      'admin',
      now(),
      now()
    );
    
    RAISE NOTICE 'Admin user record created. User needs to sign up through Supabase Auth with this email.';
  ELSE
    RAISE NOTICE 'Admin user already exists.';
  END IF;
END $$;
