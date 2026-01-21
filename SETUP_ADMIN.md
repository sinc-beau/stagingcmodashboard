# Admin User Setup Instructions

This guide explains how to set up the admin user for local development.

## Method 1: Using the Setup Page (Recommended)

1. Start the development server: `npm run dev`
2. Navigate to: `http://localhost:5173/setup`
3. Click "Create Admin User"
4. Once successful, go to the login page

## Method 2: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to Authentication > Users
3. Click "Add user" > "Create new user"
4. Enter:
   - Email: `beau.horton@sincusa.com`
   - Password: `admin123`
   - Auto Confirm User: **Yes** (check this box)
5. Click "Create user"
6. Note the User ID from the created user
7. Go to Table Editor > sponsor_users
8. Insert a new row:
   - id: [paste the User ID from step 6]
   - email: `beau.horton@sincusa.com`
   - status: `approved`
   - role: `admin`
   - created_at: current timestamp
   - approved_at: current timestamp

## Method 3: Using SQL Editor

Run this SQL in your Supabase SQL Editor (replace YOUR_USER_ID with the actual auth user ID):

```sql
-- First, create the auth user through Supabase dashboard as described in Method 2
-- Then run this SQL with the user ID:

INSERT INTO sponsor_users (id, email, status, role, approved_at, created_at)
VALUES (
  'YOUR_USER_ID', -- Replace with actual user ID from auth.users
  'beau.horton@sincusa.com',
  'approved',
  'admin',
  now(),
  now()
);
```

## Login

After setup, you can login at `/login` using:

- **Email**: beau.horton@sincusa.com
- **Password**: admin123
- **Method**: Toggle to "Password" login option

The login page now supports both:
- **Magic Link**: For passwordless authentication (production)
- **Password**: For quick local development

## Security Note

Remember to change the admin password in production environments and remove the `/setup` route before deploying to production.
